function parseResourcesToExport(resourcesInput) {
  const resourcesList = splitString(resourcesInput).map(resource =>
    resource.toUpperCase().replace(/S$/, '')
  )

  const resourceFlags = {
    exportFlows: false,
    exportConnectors: false,
    exportModels: false,
    exportTemplates: false,
    exportWebhooks: false,
    exportWidgets: false
  }

  if (resourcesList.includes('ALL')) {
    for (const flag in resourceFlags) {
      if (Object.prototype.hasOwnProperty.call(resourceFlags, flag)) {
        resourceFlags[flag] = true
      }
    }
  } else {
    // eslint-disable-next-line github/array-foreach
    resourcesList.forEach(resource => {
      switch (resource) {
        case 'FLOW':
          resourceFlags.exportFlows = true
          break
        case 'CONNECTOR':
          resourceFlags.exportConnectors = true
          break
        case 'MODEL':
          resourceFlags.exportModels = true
          break
        case 'TEMPLATE':
          resourceFlags.exportTemplates = true
          break
        case 'WEBHOOK':
          resourceFlags.exportWebhooks = true
          break
        case 'WIDGET':
          resourceFlags.exportWidgets = true
          break
        default:
          break
      }
    })
  }

  return resourceFlags
}

function splitString(input) {
  if (input) return input.split(',').map(item => item.trim())

  return []
}

function getGraphQlReqConfigs(domain, authToken, projectId, data) {
  return {
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
}

module.exports = {
  splitString,
  parseResourcesToExport,
  getGraphQlReqConfigs
}
