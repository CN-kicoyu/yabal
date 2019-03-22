const tempConfig = require('./lib/tempConfig.js')
module.exports = {
  hasProject: function (project) {
    const list = Object.keys(tempConfig.configData).map((item) => ({name: tempConfig.configData[item].name}))
    return list.includes(project)
  }
}
