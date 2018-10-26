const path = require('path')
const home = require('user-home')
const fs = require('fs')

exports.localTemplatePath = function (template) {
  return path.join(home, '.yabal-templates', template)
}

exports.templateConfigPath = path.join(home, '.yabal-templates', 'template.json')

exports.templatePackage = function (template) {
  const pkgPath = path.join(home, '.yabal-templates', template, 'package.json')
  return JSON.parse(fs.readFileSync(pkgPath), 'utf-8')
}

exports.isExistyabalConfig = function (tplPath) {
  return fs.existsSync(path.join(tplPath, "yabal.config.js"))
}
