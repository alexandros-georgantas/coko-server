const config = require('config')
const axios = require('axios')

const { Identity } = require('../models')

const getAuthTokens = async (userId, providerLabel) => {
  try {
    const providerUserIdentity = await Identity.findOne({
      userId,
      provider: providerLabel,
    })

    if (!providerUserIdentity) {
      throw new Error(`identity for provider ${providerLabel} does not exist`)
    }

    const {
      oauthAccessToken,
      oauthAccessTokenExpiration,
      oauthRefreshToken,
      oauthRefreshTokenExpiration,
    } = providerUserIdentity

    const accessTokenExpired = oauthAccessTokenExpiration < new Date().getTime()

    if (!accessTokenExpired) {
      return oauthAccessToken
    }

    const refreshTokenExpired =
      oauthRefreshTokenExpiration < new Date().getTime()

    if (refreshTokenExpired) {
      throw new Error(
        `refresh token for provider ${providerLabel} expired, authorization flow should (provider login) be followed by the user`,
      )
    }

    const integrations =
      config.has('integrations') && config.get('integrations')

    if (!integrations) {
      throw new Error('Integrations are undefined in config')
    }

    const externalProvider = integrations[providerLabel]

    if (!externalProvider) {
      throw new Error(
        `Integration ${providerLabel} configuration is undefined `,
      )
    }

    const { tokenUrl, clientId } = integrations[providerLabel]

    if (!tokenUrl) {
      throw new Error(`Integration ${providerLabel} tokenUrl is undefined `)
    }

    if (!clientId) {
      throw new Error(`Integration ${providerLabel} clientId is undefined `)
    }

    const tokenData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: oauthRefreshToken,
      client_id: clientId,
    })

    const { data } = await axios({
      method: 'post',
      url: tokenUrl,

      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: tokenData.toString(),
    })

    /* eslint-disable camelcase */
    const { access_token, expires_in, refresh_token, refresh_expires_in } = data

    await Identity.patchAndFetchById(providerUserIdentity.id, {
      oauthAccessToken: access_token,
      oauthRefreshToken: refresh_token,
      oauthAccessTokenExpiration:
        new Date().getTime() + 1000 * parseInt(expires_in, 10),
      oauthRefreshTokenExpiration:
        new Date().getTime() + 1000 * parseInt(refresh_expires_in, 10),
    })

    return access_token
    /* eslint-enable camelcase */
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = getAuthTokens
