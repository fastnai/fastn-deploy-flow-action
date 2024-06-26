const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')

async function exportProjectResources(authToken, projectId, domain, stage) {
  const data = JSON.stringify({
    query: `query ExportProjectResources($input: ExportProjectResourcesInput!) { 
      exportProjectResources(input: $input) { 
          connectors
          apis
          models
      }
  }`,
    variables: { input: { projectId, apisStage: stage } }
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
    return response.data.data.exportProjectResources
  } catch (error) {
    core.debug(`Unable to export resources for ${projectId}. Error: ${error}`)
  }
}

async function importProjectResources(
  authToken,
  projectId,
  domain,
  apis,
  models,
  connectors
) {
  const data = JSON.stringify({
    query: `mutation ImportProjectResources($input: ImportProjectResourcesInput!) { 
      importProjectResources(input: $input) 
  }`,
    variables: { input: { projectId, apis, models, connectors } }
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
    core.debug(
      `Unable to import project resources in ${projectId}. Error: ${error}`
    )
  }
}

module.exports = {
  exportProjectResources,
  importProjectResources
}
