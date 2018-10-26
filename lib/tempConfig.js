const fs = require('fs')
const rm = require('rimraf').sync
const { templateConfigPath, localTemplatePath } = require('./utils')

const tempConfig = {
  configData: null,
  init () {
    this.configData = this.originData()
  },
  originData () {
    const isExist = fs.existsSync(templateConfigPath)
    let datas = {}
    if (isExist) {
      datas = JSON.parse(fs.readFileSync(templateConfigPath, "utf-8"))
    }
    return datas
  },
  updataConfig (data) {
    for(let key in data) {
      if (data.hasOwnProperty(key)) {
          this.configData[key] = data[key]
      }
    }
    fs.writeFileSync(templateConfigPath, JSON.stringify(this.configData))
  },
  deleteData (template) {
    if (this.configData.hasOwnProperty(template)) {
      const temp = localTemplatePath(template)
      if (fs.existsSync(temp)) rm(temp)
      delete this.configData[template]
      fs.writeFileSync(templateConfigPath, JSON.stringify(this.configData))
    }
  },
  deleteFile (name) {
    const keyName = this.findTempleName(name)
    this.deleteData(keyName)
  },
  findTempleName (name) {
    for(let key in this.configData) {
      if (this.configData[key].name === name) {
        return key
      }
    }
  }
}

tempConfig.init()

module.exports = tempConfig