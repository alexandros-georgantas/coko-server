const logger = require('@pubsweet/logger')

const axios = require('axios')
const config = require('config')
const { getExpirationTime } = require('../../utils/tokens')
const { jobs } = require('../../services')

const Identity = require('./identity.model')

const {
  labels: { IDENTITY_CONTROLLER },
} = require('./constants')

const getUserIdentities = async userId => {
  try {
    return Identity.find({ userId })
  } catch (e) {
    throw new Error(e)
  }
}

const getDefaultIdentity = async userId => {
  try {
    return Identity.findOne({
      userId,
      isDefault: true,
    })
  } catch (e) {
    throw new Error(e)
  }
}

/**
 * Authorise user OAuth.
 * Save OAuth access and refresh tokens.
 * Trigger subscription indicating the identity has changed.
 */
const createOAuthIdentity = async (userId, provider, sessionState, code) => {
  // Throw error if unable to acquire and then store authorisation
  try {
    let identity = await Identity.findOne({ userId, provider })

    if (identity) {
      return identity
    }

    const { renewAfter, ...authData } = await authorizeOAuth(
      provider,
      sessionState,
      code,
    )

    const {
      email,
      given_name: givenNames,
      family_name: surname,
      sub: providerUserId,
    } = JSON.parse(
      Buffer.from(authData.oauthAccessToken.split('.')[1], 'base64').toString(),
    )

    identity = Identity.insert({
      email,
      provider,
      userId,
      profileData: {
        givenNames,
        surname,
        providerUserId,
      },
      ...authData,
    })

    await jobs.defer(
      jobs.RENEW_AUTH_TOKENS_JOB,
      { seconds: renewAfter },
      { userId, providerLabel: provider },
    )

    return identity
  } catch (e) {
    logger.error(`${IDENTITY_CONTROLLER} createOAuthIdentity: ${e.message}`)
    throw e
  }
}

/** authorizeOAuth
 * Send an Oauth2 authorisation code requesting access and refresh tokens.
 * Return the validated tokens or throw an error.
 */
const authorizeOAuth = async (provider, sessionState, code) => {
  const tokenUrl = config.get(`integrations.${provider}.tokenUrl`)
  const clientId = config.get(`integrations.${provider}.clientId`)
  const redirectUri = config.get(`integrations.${provider}.redirectUri`)

  const postData = {
    code,
    grant_type: 'authorization_code',
    session_state: sessionState,
    client_id: clientId,
    redirect_uri: redirectUri,
  }

  const params = new URLSearchParams(postData)

  // Get tokens
  const { data } = await axios({
    method: 'POST',
    url: tokenUrl,
    data: params.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (data.token_type?.toLowerCase() !== 'bearer') {
    throw new Error(`Invalid "token_type": ${data.token_type}`)
  }

  if (data.session_state !== sessionState) {
    throw new Error(`Invalid "session_state": ${data.session_state}`)
  }

  /* eslint-disable camelcase */
  const { access_token, expires_in, refresh_token, refresh_expires_in } = data

  if (!access_token || !expires_in || !refresh_token || !refresh_expires_in) {
    throw new Error('Missing data from response!')
  }

  const renewAfter = refresh_expires_in - 86400

  if (renewAfter < 0) {
    throw new Error('"renewAfter" is less than 0')
  }

  return {
    oauthAccessToken: access_token,
    oauthRefreshToken: refresh_token,
    oauthAccessTokenExpiration: getExpirationTime(expires_in),
    oauthRefreshTokenExpiration: getExpirationTime(refresh_expires_in),
    renewAfter,
  }
  /* eslint-enable camelcase */
}

module.exports = {
  createOAuthIdentity,
  getUserIdentities,
  getDefaultIdentity,
}
