const { isExistyabalConfig } = require('../lib/utils')
const Metalsmith = require('metalsmith')
const render = require('ejs').render
const mkdirp = require('mkdirp')
const path = require('path')
const async = require('async')
const customConfig = require('./customConfig.js')
const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')

const promptMapping = {
  string: 'input',
  boolean: 'confirm'
}

module.exports = function generate (project, template, dest, isClean, done) {
  const tplPath = path.join(template, 'template')
  const metalsmith = Metalsmith(tplPath)
  const isConfigExist = isExistyabalConfig(template)
  const opts = isConfigExist ? customConfig(template) : {}
  const data = Object.assign(metalsmith.metadata(), { project })
  if (opts.metalsmith && typeof opts.metalsmith.before === 'function') {
    opts.metalsmith.before(metalsmith, opts, helpers)
  }
  if (isConfigExist) metalsmith.use(askQuestions(opts.prompts)).use(renderTemplateFiles(opts.skipInterpolation))
  if (typeof opts.output === 'function') metalsmith.use(checkBuildPosition(opts.output))
  if (typeof opts.metalsmith === 'function') {
    opts.metalsmith(metalsmith, opts, helpers)
  } else if (opts.metalsmith && typeof opts.metalsmith.after === 'function') {
    opts.metalsmith.after(metalsmith, opts, helpers)
  }
  metalsmith.source('.').clean(isClean).destination(dest).build((err, files) => {
    done(err)
    if (typeof opts.completed === 'function') {
      opts.completed(data)
    }
    console.log()
    Object.keys(files).forEach((item) => {
      console.log(chalk.dim('   new file:  ') + chalk.green(item))
    })
  })
}

function askQuestions (prompts) {
  return (files, metalsmith, done) => {
    async.eachSeries(Object.keys(prompts), (key, next) => {
      prompt(metalsmith.metadata(), key, prompts[key], next)
    }, done)
  }
}

function renderTemplateFiles (skipInterpolation) {
  skipInterpolation = typeof skipInterpolation === 'string'
    ? [skipInterpolation]
    : skipInterpolation
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metalsmithMetadata = metalsmith.metadata()
    async.each(keys, (file, next) => {
      if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
        return next()
      }
      const str = files[file].contents.toString()
      if (!/\<\$=(.*?)\$\>/g.test(str)) {
        return next()
      }
      const res = render(str, metalsmithMetadata, {delimiter: '$'})
      files[file].contents = new Buffer(res)
      next()
    }, done)
  }
}

function prompt (data, key, prompt, done) {
  let promptDefault = prompt.default
  if (typeof prompt.default === 'function') {
    promptDefault = function () {
      return prompt.default.bind(this)(data)
    }
  }

  inquirer.prompt([{
    type: promptMapping[prompt.type] || prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    default: promptDefault,
    choices: prompt.choices || [],
    validate: prompt.validate || ((name) => {
      if (prompt.required && !name) {
        return 'this is required'
      } else {
        return true
      }
    })
  }]).then(answers => {
    if (Array.isArray(answers[key])) {
      data[key] = {}
      answers[key].forEach(multiChoiceAnswer => {
        data[key][multiChoiceAnswer] = true
      })
    } else if (typeof answers[key] === 'string') {
      data[key] = answers[key].replace(/"/g, '\\"')
    } else {
      data[key] = answers[key]
    }
    done()
  }).catch(done)
}

function checkBuildPosition (fn) {
  return (files, metalsmith, done) => {
    const output = fn(metalsmith.metadata())
    let isExist = false
    output.forEach((item) => {
      if (files.hasOwnProperty(item.template)) {
        mkdirp.sync(path.dirname(item.position))
        files[item.position] = files[item.template]
        delete files[item.template]
        if (fs.existsSync(path.join(process.cwd(), item.position))) {
          isExist = true
        }
      }
    })
    if (isExist) {
      inquirer.prompt([
        {
          type: 'confirm',
          message: `files exists, Make sure to overwrite the files?`,
          name: 'confirm'
        }
      ]).then(answers => {
        if (answers.confirm) {
          done()
        }
      })
    }
    done()
  }
}