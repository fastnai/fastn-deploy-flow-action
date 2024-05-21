const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const srcUsername = core.getInput('source-account-username', {
      required: true
    })
    const srcPassword = core.getInput('source-account-password', {
      required: true
    })
    const srcEnv = core.getInput('source-env', {
      required: true
    })
    const srcProjectId = core.getInput('source-project-id', {
      required: true
    })
    const srcFlowNameInput = core.getInput('source-flow-name', {
      required: true
    })

    const desUsername = core.getInput('destination-account-username', {
      required: true
    })
    const desPassword = core.getInput('destination-account-password', {
      required: true
    })
    const desEnv = core.getInput('destination-env', {
      required: true
    })
    const desProjectId = core.getInput('destination-project-id', {
      required: true
    })
    const desFlowNameInput = core.getInput('destination-flow-name')

    const srcAuthToken = await fetchAuthToken(
      srcUsername,
      srcPassword,
      pickEnv(srcEnv)
    )
    core.debug(`Fetched source auth token: ${srcAuthToken} for ${srcUsername}`)

    const srcFlowNames = srcFlowNameInput
      .split(', ')
      .filter(item => item.trim() !== '')
    console.log(`Flow names input: ${srcFlowNames}`)
    const fetchedApis = []

    for (const flowName of srcFlowNames) {
      const fetchedApi = await fetchApiFlow(
        srcAuthToken,
        srcProjectId,
        flowName,
        pickEnv(srcEnv)
      )
      fetchedApis.push(fetchedApi)
      core.debug(
        `Fetched flow: ${JSON.stringify(fetchedApi)} for ${srcUsername}`
      )
    }

    const desAuthToken = await fetchAuthToken(
      desUsername,
      desPassword,
      pickEnv(desEnv)
    )
    core.debug(`Fetched source auth token: ${desAuthToken} for ${desUsername}`)

    let desFlowNames

    if (desFlowNameInput) {
      desFlowNames = desFlowNameInput
        .split(',')
        .filter(item => item.trim() !== '')
    } else {
      desFlowNames = srcFlowNames
    }

    let nameCount = 0
    for (const api of fetchedApis) {
      await importApiFlow(
        desAuthToken,
        desProjectId,
        desFlowNames[nameCount],
        api,
        pickEnv(desEnv)
      )

      core.debug(
        `Imported ${srcFlowNames[nameCount]} from ${srcProjectId} as ${desFlowNames[nameCount]} in ${desProjectId}`
      )
      nameCount++
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

// Fetch token function
async function fetchAuthToken(username, password, env) {
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
    url: `https://auth.${env}/realms/fastn/protocol/openid-connect/token`,
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
      `Unable to retrieve auth token for ${username} in ${env}. Error: ${error}`
    )
  }
}

// Fetch API
async function fetchApiFlow(authToken, projectId, apiName, env) {
  const data = JSON.stringify({
    query: `query exportApi($input: GetEntityInput) {
    exportApi(input: $input) 
  }`,
    variables: { input: { clientId: projectId, id: apiName } }
  })

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.${env}/graphql`,
    headers: {
      authorization: `Bearer ${authToken}`,
      'content-type': 'application/json',
      'fastn-space-id': projectId,
      stage: 'LIVE',
      realm: 'fastn'
    },
    data
  }

  try {
    const response = await axios.request(config)
    return response.data.data.exportApi
  } catch (error) {
    core.debug(`Unable to fetch flow ${apiName}. Error: ${error}`)
  }
}

// Import API Flow
async function importApiFlow(authToken, projectId, apiName, apiData, env) {
  const data = JSON.stringify({
    query: `mutation importApi($input: ImportApiInput!) {
      importApi(input: $input) {
        __typename
      }
    }`,
    variables: { input: { clientId: projectId, name: apiName, data: apiData } }
  })

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.${env}/graphql`,
    headers: {
      authorization: `Bearer ${authToken}`,
      'content-type': 'application/json',
      'fastn-space-id': projectId,
      realm: 'fastn'
    },
    data
  }

  try {
    const response = await axios.request(config)
  } catch (error) {
    core.debug(`Unable to import flow ${apiName}. Error: ${error}`)
  }
}

//Helper - set url
function pickEnv(env) {
  return env
}

module.exports = {
  run
}
