const core = require('@actions/core')
const axios = require('axios')
const qs = require('qs')

const { importApis, deployApiFlowToStage, exportApis } = require('./apis/flows')
const { fetchAuthToken } = require('./apis/auth')
const { splitString, parseResourcesToExport } = require('./utilities/helpers')
const { exportConnectors, importConnectors } = require('./apis/connectors')
const { exportWebhooks, importWebhooks } = require('./apis/webhooks')
const {
  exportWidgetConnectors,
  importWidgetConnectors
} = require('./apis/widget-connectors')
const { exportModels, importModels } = require('./apis/models')
const { exportTemplates, importTemplates } = require('./apis/templates')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // Source Inputs TODO: Cleanup
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
    const resourcesToExport = core.getInput('source-resources')
    // Flow Inputs
    const srcFlowNameInput = core.getInput('source-flow-names')
    const srcFlowStage = core.getInput('source-flow-stage')
    // Connector Inputs
    const srcConnectorIdInput = core.getInput('source-connector-ids')
    const srcConnectorOrgId = core.getInput('source-connector-org-id')
    const srcConnectorGroupIdInput = core.getInput('source-connector-group-ids')
    // Model Inputs
    const srcModelIdInput = core.getInput('source-model-ids')
    // Template Inputs
    const srcTemplateIdInput = core.getInput('source-template-ids')
    const srcTemplateOrgId = core.getInput('source-template-org-id')
    // Webhook Inputs
    const srcWebhookIdInput = core.getInput('source-webhook-ids')
    // Widget Inputs
    const srcWidgetIdInput = core.getInput('source-widget-ids')

    // Destination Inputs
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
    // Flow Inputs
    const desFlowStage = core.getInput('destination-flow-stage')
    // Connector Inputs
    const desConnectorOrgId = core.getInput('destination-connector-org-id')
    // Template Inputs
    const desTemplateOrgId = core.getInput('destination-template-org-id')

    const resourceFlags = parseResourcesToExport(resourcesToExport)

    const srcAuthToken = await fetchAuthToken(
      srcUsername,
      srcPassword,
      srcDomain
    )
    core.debug(`Fetched source auth token: ${srcAuthToken} for ${srcUsername}`)

    const desAuthToken = await fetchAuthToken(
      desUsername,
      desPassword,
      desDomain
    )
    core.debug(
      `Fetched destination auth token: ${desAuthToken} for ${desUsername}`
    )

    // Export and Import Connectors
    if (resourceFlags.exportConnectors) {
      core.debug(`Exporting Connectors`)
      const exportedConnectors = await exportConnectors(
        srcAuthToken,
        srcProjectId,
        srcConnectorOrgId,
        splitString(srcConnectorIdInput),
        splitString(srcConnectorGroupIdInput),
        srcDomain
      )

      if (exportedConnectors) {
        core.debug(`Importing Connectors`)
        await importConnectors(
          desAuthToken,
          desProjectId,
          desConnectorOrgId,
          exportedConnectors,
          desDomain
        )
      }
    }

    // Export and Import Templates
    if (resourceFlags.exportTemplates) {
      core.debug(`Exporting Templates`)
      const exportedTemplates = await exportTemplates(
        srcAuthToken,
        srcProjectId,
        srcTemplateOrgId,
        splitString(srcTemplateIdInput),
        srcDomain
      )

      if (exportedTemplates) {
        core.debug(`Importing Templates`)
        await importTemplates(
          desAuthToken,
          desProjectId,
          desTemplateOrgId,
          exportedTemplates,
          desDomain
        )
      }
    }
    // Export and Import Models
    if (resourceFlags.exportModels) {
      core.debug(`Exporting Models`)
      const exportedModels = await exportModels(
        srcAuthToken,
        srcProjectId,
        splitString(srcModelIdInput),
        srcDomain
      )

      if (exportedModels) {
        core.debug(`Importing Models`)
        await importModels(
          desAuthToken,
          desProjectId,
          exportedModels,
          desDomain
        )
      }
    }
    // Export and Import Flows
    if (resourceFlags.exportFlows) {
      core.debug(`Exporting Flows`)
      core.debug(`${JSON.stringify(splitString(srcFlowNameInput))}`)
      const exportedFlows = await exportApis(
        srcAuthToken,
        srcProjectId,
        srcDomain,
        srcFlowStage || 'LIVE',
        splitString(srcFlowNameInput)
      )

      if (exportedFlows) {
        core.debug(`Importing Flows`)
        await importApis(
          desAuthToken,
          desProjectId,
          exportedFlows,
          desFlowStage || 'LIVE',
          desDomain
        )

        core.debug(`Deploying Flows`)
        for (const apiName of splitString(srcFlowNameInput)) {
          await deployApiFlowToStage(
            desAuthToken,
            desProjectId,
            apiName,
            desFlowStage,
            desDomain
          )
          core.debug(`Deployed ${apiName} to ${desFlowStage}`)
        }
      }
    }
    // Export and Import Webhooks
    if (resourceFlags.exportWebhooks) {
      core.debug(`Exporting Webhooks`)
      const exportedWebhooks = await exportWebhooks(
        srcAuthToken,
        srcProjectId,
        splitString(srcWebhookIdInput),
        srcDomain
      )

      if (exportedWebhooks) {
        core.debug(`Importing Webhooks`)
        await importWebhooks(
          desAuthToken,
          desProjectId,
          exportedWebhooks,
          desDomain
        )
      }
    }
    // Export and Import Widgets
    if (resourceFlags.exportWidgets) {
      core.debug(`Exporting Widgets`)
      const exportedWidgetConnectors = await exportWidgetConnectors(
        srcAuthToken,
        srcProjectId,
        splitString(srcWidgetIdInput),
        srcDomain
      )

      if (exportedWidgetConnectors) {
        core.debug(`Importing Widgets`)
        await importWidgetConnectors(
          desAuthToken,
          desProjectId,
          exportedWidgetConnectors,
          desDomain
        )
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
