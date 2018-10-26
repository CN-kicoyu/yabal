const path = require('path')

module.exports = function customConfig (dir) {
  const datas = require(path.join(dir, "yabal.config.js"))
  if (datas !== Object(datas)) {
    throw new Error('yabal.config.js needs to expose an object')
  }
  return datas
}
