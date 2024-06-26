const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')

const { deployApiFlowToStage } = require('./apis/flows')
const { fetchAuthToken } = require('./apis/auth')
const {
  exportProjectResources,
  importProjectResources
} = require('./apis/projects')

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
    const srcDomain = core.getInput('source-domain', {
      required: true
    })
    const srcProjectId = core.getInput('source-project-id', {
      required: true
    })
    const srcFlowNameInput = core.getInput('source-flow-name', {
      required: true
    })
    core.debug(` ${srcFlowNameInput}`)
    const srcStage = core.getInput('source-stage')

    const desUsername = core.getInput('destination-account-username', {
      required: true
    })
    const desPassword = core.getInput('destination-account-password', {
      required: true
    })
    const desDomain = core.getInput('destination-domain', {
      required: true
    })
    const desProjectId = core.getInput('destination-project-id', {
      required: true
    })
    const desFlowNameInput = core.getInput('destination-flow-name')
    const desStage = core.getInput('destination-stage')

    const srcAuthToken = await fetchAuthToken(
      srcUsername,
      srcPassword,
      srcDomain
    )
    core.debug(`Fetched source auth token: ${srcAuthToken} for ${srcUsername}`)

    const exportData = await exportProjectResources(
      srcAuthToken,
      srcProjectId,
      srcDomain,
      srcStage
    )

    core.debug(`Exported project resources from ${srcProjectId}.`)

    // Fetch APIs

    //   for (const flowName of srcFlowNames) {
    //     const fetchedApi = await flows.fetchApiFlow(
    //       srcAuthToken,
    //       srcProjectId,
    //       flowName,
    //       srcDomain
    //     )
    //     fetchedApis.push(fetchedApi)
    //     core.debug(
    //       `Fetched flow: ${JSON.stringify(fetchedApi)} for ${srcUsername}`
    //     )
    //   }
    // } else {
    //   fetchedApis = await flows.fetchApiFlowsByStage(
    //     srcAuthToken,
    //     srcProjectId,
    //     srcDomain,
    //     srcStage
    //   )

    //   for (const api of fetchedApis) {
    //     srcFlowNames.push(api.api.name)
    //   }

    //   core.debug(
    //     `Fetched flows: ${JSON.stringify(fetchedApis)} for ${srcUsername}`
    //   )
    // }

    const desAuthToken = await fetchAuthToken(
      desUsername,
      desPassword,
      desDomain
    )
    core.debug(
      `Fetched destination auth token: ${desAuthToken} for ${desUsername}`
    )

    // filter out specific apis here
    let srcFlowNames = []
    let apisToImport = []

    if (srcFlowNameInput) {
      srcFlowNames = srcFlowNameInput
        .split(', ')
        .filter(item => item.trim() !== '')
      core.debug(`Flow names input: ${srcFlowNames}`)

      apisToImport = exportData.apis.filter(api =>
        srcFlowNames.includes('activateMicrosoftGraph')
      )
    } else {
      apisToImport = exportData.apis
    }

    core.debug(`Apis to import ${apisToImport}`)

    const fetchedFlowNames = []

    for (const flow of apisToImport) {
      fetchedFlowNames.push(flow.name)
    }

    // import project resources
    await importProjectResources(
      desAuthToken,
      desProjectId,
      desDomain,
      apisToImport,
      exportData.models,
      exportData.connectors
    )
    core.debug(`Imported project resources in ${desProjectId}`)

    // // deploy flows
    for (const apiName of fetchedFlowNames) {
      await deployApiFlowToStage(
        desAuthToken,
        desProjectId,
        apiName,
        desStage,
        desDomain
      )
      core.debug(`Deployed ${apiName} to ${desStage}`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
