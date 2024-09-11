const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')
const { getGraphQlReqConfigs } = require('../utilities/helpers')

async function exportModels(authToken, projectId, ids, domain) {
  const data = JSON.stringify({
    query: `query exportModels($input: ExportModelsInput) {
      exportModels(input: $input) 
    }`,
    variables: {
      input: { projectId, ids }
    }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(
      `Fetched models: ${JSON.stringify(response.data.data.exportModels)} from ${projectId} on ${domain}`
    )
    return response.data.data.exportModels
  } catch (error) {
    core.error(`Unable to fetch models. Error: ${error}`)
  }
}

async function importModels(authToken, projectId, models, domain) {
  const data = JSON.stringify({
    query: `mutation importModels($input: ImportModelsInput) {
      importModels(input: $input) 
    }`,
    variables: { input: { projectId, models } }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(response.data)
  } catch (error) {
    core.error(`Unable to import models. Error: ${error}`)
  }
}

module.exports = {
  exportModels,
  importModels
}
