const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')
const { getGraphQlReqConfigs } = require('../utilities/helpers')

async function exportApis(authToken, projectId, domain, stage, ids) {
  const data = JSON.stringify({
    query: `query exportApis($input: ExportApisInput) {
      exportApis(input: $input) 
    }`,
    variables: { input: { projectId, stage, ids } }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(`${JSON.stringify(config)}`)
    core.debug(`${JSON.stringify(ids)}`)
    core.debug(
      `Fetched flows: ${JSON.stringify(response.data.data.exportApis)} from ${projectId} and stage ${stage} on ${domain}`
    )
    return response.data.data.exportApis
  } catch (error) {
    core.debug(`Unable to fetch flows. Error: ${error}`)
  }
}

async function importApis(authToken, projectId, apis, stage, domain) {
  const data = JSON.stringify({
    query: `mutation importApis($input: ImportApisInput) {
      importApis(input: $input) 
    }`,
    variables: { input: { projectId, apis, stage } }
  })

  const config = getGraphQlReqConfigs(domain, authToken, projectId, data)

  try {
    const response = await axios.request(config)
    core.debug(response.data)
  } catch (error) {
    core.debug(`Unable to import flows. Error: ${error}`)
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
  exportApis,
  importApis,
  deployApiFlowToStage
}
