const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')
const { getGraphQlReqConfigs } = require('../utilities/helpers')

async function exportWebhooks(authToken, projectId, ids, domain) {
  const data = JSON.stringify({
    query: `query exportWebhooks($input: ExportWebhooksInput) {
      exportWebhooks(input: $input) 
    }`,
    variables: {
      input: { projectId, ids }
    }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(
      `Fetched webhooks: ${JSON.stringify(response.data.data.exportWebhooks)} from ${projectId} on ${domain}`
    )
    return response.data.data.exportWebhooks
  } catch (error) {
    core.error(`Unable to fetch webhooks. Error: ${error}`)
  }
}

async function importWebhooks(authToken, projectId, webhooks, domain) {
  const data = JSON.stringify({
    query: `mutation importWebhooks($input: ImportWebhooksInput) {
      importWebhooks(input: $input) 
    }`,
    variables: { input: { projectId, webhooks } }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(response.data)
  } catch (error) {
    core.error(`Unable to import webhooks. Error: ${error}`)
  }
}

module.exports = {
  exportWebhooks,
  importWebhooks
}
