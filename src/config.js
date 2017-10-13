const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const { mounts } = require('kenote-mount')
const base = require('./base')

const { 
  rootQuest,
  configQuest,
} = mounts(path.resolve(__dirname, './questions'), 'quest')

exports.set = () => {
  let options = null
  return inquirer.prompt(rootQuest('./src/config'))
    .then( answers => {
      options = answers
      return inquirer.prompt(configQuest)
    })
    .then( answers => {
      options = Object.assign(options, answers)
      let rootDir = path.resolve(base.__BASEDIR, options.root)
      !fs.existsSync(rootDir) && fs.mkdirpSync(rootDir)
      let dir = path.resolve(base.__BASEDIR, options.root, 'index.js')
      let data = `export default {\n`
        + `  domain: '${options.domain}',\n`
        + `  apiPath: '${options.apiPath}',\n`
        + `}`
      fs.writeFileSync(dir, data, { encoding: 'utf-8' })
      console.log(`\n    config set sccuess!\n`)
    })
}