const config = require('config')
const mailer = require('@pubsweet/component-send-email')
const { logger } = require('../index')

const {
  labels: { EMAIL_SERVICE },
} = require('./constants')

const sendEmail = data => {
  const { content, subject, to } = data

  const emailData = {
    from: config.get('mailer.from'),
    html: `<p>${content}</p>`,
    subject: `${subject}`,
    text: content,
    to,
  }

  mailer.send(emailData)
  logger.info(
    `${EMAIL_SERVICE} sendEmail: email sent to ${to} with subject ${subject}`,
  )
}

module.exports = { sendEmail }
