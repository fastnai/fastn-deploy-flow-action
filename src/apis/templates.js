const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')
const { getGraphQlReqConfigs } = require('../utilities/helpers')

async function exportTemplates(authToken, projectId, orgId, ids, domain) {
  const data = JSON.stringify({
    query: `query exportTemplates($input: ExportTemplatesInput) {
      exportTemplates(input: $input) 
    }`,
    variables: {
      input: { projectId, orgId, ids }
    }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(
      `Fetched templates: ${JSON.stringify(response.data.data.exportTemplates)} from ${projectId} on ${domain}`
    )
    return response.data.data.exportTemplates
  } catch (error) {
    core.error(`Unable to fetch templates. Error: ${error}`)
  }
}

async function importTemplates(authToken, projectId, orgId, templates, domain) {
  const data = JSON.stringify({
    query: `mutation importTemplates($input: ImportTemplatesInput) {
      importTemplates(input: $input) 
    }`,
    variables: { input: { projectId, orgId, templates } }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(response.data)
  } catch (error) {
    core.error(`Unable to import templates. Error: ${error}`)
  }
}

module.exports = {
  exportTemplates,
  importTemplates
}
