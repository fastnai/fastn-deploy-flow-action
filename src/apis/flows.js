const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')

async function fetchApiFlow(authToken, projectId, apiName, domain) {
  const data = JSON.stringify({
    query: `query exportApi($input: GetEntityInput) {
    exportApi(input: $input) 
  }`,
    variables: { input: { clientId: projectId, id: apiName } }
  })

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.${domain}/graphql`,
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
    return response.data.data.exportApi
  } catch (error) {
    core.debug(`Unable to fetch flow ${apiName}. Error: ${error}`)
  }
}

async function fetchApiFlowsByStage(authToken, projectId, domain, stage) {
  const data = JSON.stringify({
    query: `query exportDeployedApis($input: ExportDeployedApisInput) {
      exportDeployedApis(input: $input) 
    }`,
    variables: { input: { projectId, stage } }
  })

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.${domain}/graphql`,
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
    return response.data.data.exportDeployedApis.map(apiData => {
      return { api: apiData }
    })
  } catch (error) {
    core.debug(`Unable to fetch flows. Error: ${error}`)
  }
}

async function importApiFlow(authToken, projectId, apiName, apiData, domain) {
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
    url: `https://api.${domain}/graphql`,
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
    core.debug(response.data)
  } catch (error) {
    core.debug(`Unable to import flow ${apiName}. Error: ${error}`)
  }
}

async function deployApiFlowToStage(
  authToken,
  projectId,
  apiName,
  stage,
  domain
) {
  const data = JSON.stringify({
    query: `mutation deployApiToStage($input: deployApiToStageInput!) {
      deployApiToStage(input: $input) {
        __typename
      }
    }`,
    variables: { input: { clientId: projectId, id: apiName, env: stage } }
  })

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://api.${domain}/graphql`,
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
    core.debug(response.data)
  } catch (error) {
    core.debug(`Unable to deploy flow ${apiName}. Error: ${error}`)
  }
}

module.exports = {
  fetchApiFlow,
  fetchApiFlowsByStage,
  importApiFlow,
  deployApiFlowToStage
}
