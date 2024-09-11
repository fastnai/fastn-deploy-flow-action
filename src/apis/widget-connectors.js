const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')
const { getGraphQlReqConfigs } = require('../utilities/helpers')

async function exportWidgetConnectors(authToken, projectId, ids, domain) {
  const data = JSON.stringify({
    query: `query exportWidgetConnectors($input: ExportWidgetConnectorsInput) {
      exportWidgetConnectors(input: $input) 
    }`,
    variables: {
      input: { projectId, ids }
    }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(
      `Fetched widget connectors: ${JSON.stringify(response.data.data.exportWidgetConnectors)} from ${projectId} on ${domain}`
    )
    return response.data.data.exportWidgetConnectors
  } catch (error) {
    core.error(`Unable to fetch widget connectors. Error: ${error}`)
  }
}

async function importWidgetConnectors(
  authToken,
  projectId,
  widgetConnectors,
  domain
) {
  const data = JSON.stringify({
    query: `mutation importWidgetConnectors($input: ImportWidgetConnectorsInput) {
      importWidgetConnectors(input: $input) 
    }`,
    variables: { input: { projectId, widgetConnectors } }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(response.data)
  } catch (error) {
    core.error(`Unable to import widget connectors. Error: ${error}`)
  }
}

module.exports = {
  exportWidgetConnectors,
  importWidgetConnectors
}
