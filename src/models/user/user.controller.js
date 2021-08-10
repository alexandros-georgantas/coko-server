const config = require('config')
const crypto = require('crypto')
const moment = require('moment')

const { AuthorizationError, ValidationError } = require('@pubsweet/errors')

const { User } = require('../index')
const { logger, createJWT, useTransaction } = require('../../index')
const Identity = require('../identity/identity.model')
const { cleanUndefined } = require('../_helpers/utilities')

const {
  identityVerification,
  passwordUpdate,
  requestResetPassword,
  requestResetPasswordEmailNotFound,
} = require('../_helpers/emailTemplates')

const { sendEmail } = require('../../services/email')
const { labels: USER_CONTROLLER } = require('./constants')

const getUser = async (id, options = {}) => {
  try {
    logger.info(`${USER_CONTROLLER} getUser: fetching user with id ${id}`)
    return User.findById(id, options)
  } catch (e) {
    logger.error(`${USER_CONTROLLER} getUser: ${e.message}`)
    throw new Error(e)
  }
}

const getUsers = async (options = {}) => {
  try {
    logger.info(
      `${USER_CONTROLLER} getUsers: fetching all users based on provided options ${options}`,
    )
    return User.find({}, options)
  } catch (e) {
    logger.error(`${USER_CONTROLLER} getUsers: ${e.message}`)
    throw new Error(e)
  }
}

const deleteUser = async (id, options = {}) => {
  try {
    logger.info(`${USER_CONTROLLER} deleteUser: removing user with id ${id}`)
    return User.deleteById(id, options)
  } catch (e) {
    logger.error(`${USER_CONTROLLER} deleteUser: ${e.message}`)
    throw new Error(e)
  }
}

const deactivateUser = async (id, options = {}) => {
  try {
    logger.info(
      `${USER_CONTROLLER} deactivateUser: deactivating user with id ${id}`,
    )
    return User.patchAndFetchById(id, { isActive: false })
  } catch (e) {
    logger.error(`${USER_CONTROLLER} deactivateUser: ${e.message}`)
    throw new Error(e)
  }
}

const updateUser = async (id, data, options = {}) => {
  try {
    const cleanedData = cleanUndefined(data)
    const { email, identityId, ...restData } = cleanedData
    const { trx, ...restOptions } = options
    logger.info(`${USER_CONTROLLER} updateUser: updating user with id ${id}`)

    return useTransaction(
      async tr => {
        if (!email) {
          return User.patchAndFetchById(
            id,
            { ...restData },
            {
              trx: tr,
              ...restOptions,
            },
          )
        }

        logger.info(
          `${USER_CONTROLLER} updateUser: updating user identity with provided email`,
        )

        if (!identityId) {
          throw new Error(
            `${USER_CONTROLLER} updateUser: cannot update email without identity id`,
          )
        }

        await Identity.patchAndFetchById(identityId, { email }, { trx: tr })

        if (Object.keys(restData).length !== 0) {
          logger.info(
            `${USER_CONTROLLER} updateUser: updating user with provided info`,
          )
          return User.patchAndFetchById(id, ...restData, {
            trx: tr,
            ...restOptions,
          })
        }

        return User.findById(id, {
          trx: tr,
          ...restOptions,
        })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} updateUser: ${e.message}`)
    throw new Error(e)
  }
}

const login = async (password, email = undefined, username = undefined) => {
  try {
    let isValid = false
    let user

    if (!username) {
      logger.info(
        `${USER_CONTROLLER} login: searching for user with email ${email}`,
      )
      const identity = await Identity.findOne({ email })
      user = User.findById(identity.userId)
    } else {
      logger.info(
        `${USER_CONTROLLER} login: searching for user with username ${username}`,
      )
      user = await User.findOne({ username })
    }

    logger.info(
      `${USER_CONTROLLER} login: checking password validity for user with id ${user.id}`,
    )

    isValid = await user.validPassword(password)

    if (!isValid) {
      throw new AuthorizationError('Wrong username or password.')
    }

    logger.info(`${USER_CONTROLLER} login: password is valid`)
    return {
      user,
      token: createJWT(user),
    }
  } catch (e) {
    logger.error(`${USER_CONTROLLER} login: ${e.message}`)
    throw new Error(e)
  }
}

const signUp = async (data, options = {}) => {
  try {
    const cleanedData = cleanUndefined(data)
    const { email, ...restData } = cleanedData
    const { trx } = options
    return useTransaction(
      async tr => {
        if (!email) {
          logger.info(`${USER_CONTROLLER} signUp: creating user`)
          return User.insert({ ...restData }, { trx: tr })
        }

        logger.info(`${USER_CONTROLLER} signUp: creating user`)

        const user = await User.insert({ ...restData }, { trx: tr })

        logger.info(
          `${USER_CONTROLLER} signUp: creating user local identity with provided email`,
        )
        await Identity.insert(
          { userId: user.id, email, isSocial: false },
          { trx: tr },
        )

        return user
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} signUp: ${e.message}`)
    throw new Error(e)
  }
}

const verifyEmail = async (token, options = {}) => {
  try {
    const { trx } = options
    logger.info(`${USER_CONTROLLER} verifyEmail: verifying user email`)
    return useTransaction(
      async tr => {
        const identity = await Identity.findOne(
          {
            verificationToken: token,
          },
          { trx: tr },
        )

        const emailVerificationExpiryAmount = config.get(
          'pubsweet-server.emailVerificationTokenExpiry.amount',
        )

        const emailVerificationExpiryUnit = config.get(
          'pubsweet-server.emailVerificationTokenExpiry.unit',
        )

        if (!identity)
          throw new Error(`${USER_CONTROLLER} verifyEmail: invalid token`)

        if (identity.isVerified)
          throw new Error(
            `${USER_CONTROLLER} verifyEmail: identity has already been confirmed`,
          )

        if (!identity.verificationTokenTimestamp) {
          throw new Error(
            `${USER_CONTROLLER} verifyEmail: confirmation token does not have a corresponding timestamp`,
          )
        }

        if (
          moment()
            .subtract(
              emailVerificationExpiryAmount,
              emailVerificationExpiryUnit,
            )
            .isAfter(identity.verificationTokenTimestamp)
        ) {
          throw new Error(`${USER_CONTROLLER} verifyEmail: Token expired`)
        }

        await Identity.patch(
          { column: 'id', value: identity.id },
          {
            isVerified: true,
          },
          { trx: tr },
        )

        return true
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} verifyEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resendVerificationEmail = async (token, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${USER_CONTROLLER} resendVerificationEmail: resending verification email to user`,
    )
    return useTransaction(
      async tr => {
        const identity = await Identity.findOne(
          {
            verificationToken: token,
          },
          { trx: tr },
        )

        if (!identity)
          throw new Error(
            `${USER_CONTROLLER} resendVerificationEmail: Token does not correspond to an identity`,
          )

        const verificationToken = crypto.randomBytes(64).toString('hex')
        const verificationTokenTimestamp = new Date()

        await Identity.patch(
          { column: 'id', value: identity.id },
          {
            verificationToken,
            verificationTokenTimestamp,
          },
          { trx: tr },
        )

        const emailData = identityVerification({
          verificationToken,
          email: identity.email,
        })

        sendEmail(emailData)

        return true
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} resendVerificationEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resendVerificationEmailFromLogin = async (username, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `${USER_CONTROLLER} resendVerificationEmailFromLogin: resending verification email based on form`,
    )
    return useTransaction(
      async tr => {
        const user = await User.findOne({ username }, { trx: tr })
        if (!user)
          throw new Error(
            `${USER_CONTROLLER} resendVerificationEmailFromLogin: no user with username ${username} found`,
          )

        const identity = await Identity.findOne(
          {
            isDefault: true,
            userId: user.id,
          },
          { trx: tr },
        )

        if (!identity)
          throw new Error(
            `${USER_CONTROLLER} resendVerificationEmailFromLogin: no default identity found for user with id ${user.id}`,
          )

        const verificationToken = crypto.randomBytes(64).toString('hex')
        const verificationTokenTimestamp = new Date()

        await Identity.patch(
          { column: 'id', value: identity.id },
          {
            verificationToken,
            verificationTokenTimestamp,
          },
          { trx: tr },
        )

        const emailData = identityVerification({
          verificationToken,
          email: identity.email,
        })

        sendEmail(emailData)

        return true
      },
      { trx },
    )
  } catch (e) {
    logger.error(
      `${USER_CONTROLLER} resendVerificationEmailFromLogin: ${e.message}`,
    )
    throw new Error(e)
  }
}

const updatePassword = async (id, currentPassword, newPassword) => {
  try {
    logger.info(`${USER_CONTROLLER} updatePassword: updating user password`)
    await User.updatePassword(id, currentPassword, newPassword)
    const identity = await Identity.findOne({ isDefault: true, userId: id })

    const emailData = passwordUpdate({
      email: identity.email,
    })

    sendEmail(emailData)

    return true
  } catch (e) {
    logger.error(`${USER_CONTROLLER} updatePassword: ${e.message}`)
    throw new Error(e)
  }
}

const sendPasswordResetEmail = async (email, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const tokenLength = config.has('password-reset.token-length')
          ? config.get('password-reset.token-length')
          : 32

        const identity = await Identity.findOne(
          {
            isDefault: true,
            email: email.toLowerCase(),
          },
          { trx: tr },
        )

        if (!identity) {
          const emailData = requestResetPasswordEmailNotFound({
            email: email.toLowerCase(),
          })

          sendEmail(emailData)
          return true
        }

        const user = await User.findById(identity.userId, { trx: tr })

        const resetToken = crypto.randomBytes(tokenLength).toString('hex')

        await User.patch(
          { column: 'id', value: user.id },
          {
            passwordResetTimestamp: new Date(),
            passwordResetToken: resetToken,
          },
          { trx: tr },
        )

        logger.info(
          `${USER_CONTROLLER} sendPasswordResetEmail: sending password reset email`,
        )

        const emailData = requestResetPassword({
          email: email.toLowerCase(),
          token: resetToken,
        })

        sendEmail(emailData)

        return true
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} sendPasswordResetEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resetPassword = async (token, password, options = {}) => {
  try {
    const { trx } = options
    logger.info(`${USER_CONTROLLER} resetPassword: resetting user password`)
    return useTransaction(
      async tr => {
        const user = await User.findOne(
          { passwordResetToken: token },
          { trx: tr, related: 'defaultIdentity' },
        )

        if (!user) {
          throw new Error(
            `${USER_CONTROLLER} resetPassword: no user found with token ${token}`,
          )
        }

        const passwordResetTokenExpiryAmount = config.get(
          'pubsweet-server.passwordResetTokenTokenExpiry.amount',
        )

        const passwordResetTokenExpiryUnit = config.get(
          'pubsweet-server.passwordResetTokenTokenExpiry.unit',
        )

        if (
          moment()
            .subtract(
              passwordResetTokenExpiryAmount,
              passwordResetTokenExpiryUnit,
            )
            .isAfter(user.passwordResetTimestamp)
        ) {
          throw new ValidationError(
            `${USER_CONTROLLER} resetPassword: your token has expired`,
          )
        }

        await User.patch(
          { column: 'id', value: user.id },
          {
            password,
            passwordResetTimestamp: null,
            passwordResetToken: null,
          },
          { trx: tr },
        )

        const emailData = passwordUpdate({
          email: user.defaultIdentity.email,
        })

        sendEmail(emailData)

        return true
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} resetPassword: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  getUser,
  getUsers,
  deleteUser,
  deactivateUser,
  updateUser,
  login,
  signUp,
  verifyEmail,
  resendVerificationEmail,
  resendVerificationEmailFromLogin,
  updatePassword,
  sendPasswordResetEmail,
  resetPassword,
}
