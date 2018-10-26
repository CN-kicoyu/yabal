const chalk = require('chalk')
const format = require('util').format

const prefix = '   ' + chalk.dim('[ ') + 'yabal' + chalk.dim(' ]')
const sep = chalk.gray('·')

exports.fatal = function (...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim()
  const msg = format.apply(format, args)
  console.error(chalk.red(prefix), sep, chalk.magenta(msg))
  process.exit(1)
}

exports.success = function (...args) {
  const msg = format.apply(format, args)
  console.log(chalk.greenBright(prefix), sep, chalk.yellowBright(msg))
}
