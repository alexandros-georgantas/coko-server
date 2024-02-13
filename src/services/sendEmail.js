const nodemailer = require('nodemailer')
const config = require('config')

const logger = require('../logger')

let mailerConfig

if (config.has('mailer.path')) {
  mailerConfig = require(config.get('mailer.path')) // eslint-disable-line import/no-dynamic-require, global-require
} else if (config.has('mailer.transport')) {
  mailerConfig = config.get('mailer')
}

module.exports = {
  send: mailData => {
    if (!mailerConfig || !mailerConfig.transport) {
      throw new Error(`Mailer: The configuration is either invalid or missing`)
    }

    const transporter = nodemailer.createTransport(mailerConfig.transport)

    return transporter
      .sendMail(mailData)
      .then(info => {
        if (process.env.NODE_ENV === 'development') {
          try {
            logger.info(
              `Email sent. Preview available at: ${nodemailer.getTestMessageUrl(
                info,
              )}`,
            )
          } catch (err) {
            logger.info(`Email sent.`)
          }
        }

        return info
      })
      .catch(err => {
        logger.error(`Failed to send email ${err}`)
      })
  },
}
