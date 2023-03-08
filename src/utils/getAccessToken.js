const get = require('lodash/get')
const config = require('config')
const axios = require('axios')

const { ServiceCredential } = require('../models')

const getAccessToken = async (serviceName, renew = false) => {
  try {
    const services = config.has('services') && config.get('services')

    if (!services) {
      throw new Error('services are undefined')
    }

    const service = get(services, `${serviceName}`)

    if (!service) {
      throw new Error(`service ${serviceName} configuration is undefined `)
    }

    const { clientId, clientSecret, url } = service

    if (!clientId) {
      throw new Error(`service ${serviceName} clientId is undefined `)
    }

    if (!clientSecret) {
      throw new Error(`service ${serviceName} clientSecret is undefined `)
    }

    if (!url) {
      throw new Error(`service ${serviceName} url is undefined `)
    }

    const buff = Buffer.from(`${clientId}:${clientSecret}`, 'utf8')
    const base64data = buff.toString('base64')

    const serviceHealthCheck = await axios({
      method: 'get',
      url: `${url}/healthcheck`,
    })

    const { data: healthCheckData } = serviceHealthCheck
    const { message } = healthCheckData

    if (message !== 'Coolio') {
      throw new Error(`service ${serviceName} is down`)
    }

    const foundServiceCredential = await ServiceCredential.findOne({
      name: serviceName,
    })

    if (!foundServiceCredential) {
      const { data } = await axios({
        method: 'post',
        url: `${url}/api/auth`,
        headers: { authorization: `Basic ${base64data}` },
      })

      const { accessToken } = data
      await ServiceCredential.insert({
        name: serviceName,
        accessToken,
      })
      return accessToken
    }

    const { accessToken, id } = foundServiceCredential

    if (!accessToken || renew) {
      const { data } = await axios({
        method: 'post',
        url: `${url}/api/auth`,
        headers: { authorization: `Basic ${base64data}` },
      })

      const { accessToken: freshAccessToken } = data
      await ServiceCredential.patchAndFetchById(id, {
        accessToken: freshAccessToken,
      })
      return freshAccessToken
    }

    return accessToken
  } catch (e) {
    const foundServiceCredential = await ServiceCredential.findOne({
      name: serviceName,
    })

    if (foundServiceCredential) {
      await ServiceCredential.patchAndFetchById(foundServiceCredential.id, {
        accessToken: null,
      })
    }

    throw new Error(e)
  }
}

module.exports = getAccessToken
