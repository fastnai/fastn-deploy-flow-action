const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')
const { getGraphQlReqConfigs } = require('../utilities/helpers')

async function exportConnectors(
  authToken,
  projectId,
  orgId,
  dataSourceIds,
  groupIds,
  domain
) {
  const data = JSON.stringify({
    query: `query exportConnectors($input: ExportConnectorsGroupInput!) {
      exportConnectors(input: $input) 
    }`,
    variables: {
      input: { projectId, orgId, dataSourceIds, groupIds }
    }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    core.debug(`${JSON.stringify(config)}`)
    const response = await axios.request(config)
    core.debug(
      `Fetched connectors: ${JSON.stringify(response.data.data.exportConnectors)} from ${projectId} on ${domain}`
    )
    return response.data.data.exportConnectors
  } catch (error) {
    core.error(`Unable to fetch connectors. Error: ${error}`)
  }
}

async function importConnectors(
  authToken,
  projectId,
  orgId,
  connectors,
  domain
) {
  const data = JSON.stringify({
    query: `mutation importConnectors($input: ImportConnectorsResourcesInput) {
      importConnectors(input: $input) 
    }`,
    variables: {
      input: {
        projectId,
        orgId,
        connectors
      }
    }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    core.debug(`${JSON.stringify(config)}`)
    const response = await axios.request(config)
    core.debug(response.data)
  } catch (error) {
    core.error(`Unable to import connectors. Error: ${error}`)
  }
}

module.exports = {
  exportConnectors,
  importConnectors
}
