const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')

async function fetchAuthToken(username, password, domain) {
  const data = qs.stringify({
    grant_type: 'password',
    username,
    password,
    client_id: 'fastn-app',
    scope: 'openid'
  })

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://auth.${domain}/realms/fastn/protocol/openid-connect/token`,
    headers: {
      realm: 'fastn',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  }

  try {
    const response = await axios.request(config)
    return response.data.access_token
  } catch (error) {
    core.debug(
      `Unable to retrieve auth token for ${username} in ${domain}. Error: ${error}`
    )
  }
}

module.exports = {
  fetchAuthToken
}
