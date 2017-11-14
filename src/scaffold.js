const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const { mounts } = require('kenote-mount')
const base = require('./base')
const config = require('./')
const runscript = require('runscript')

const { 
  scaffoldQuest,
  vserionQuest,
  packageQuest
} = mounts(path.resolve(__dirname, './questions'), 'quest')
const scaffoldPath = path.resolve(process.env.HOME || process.env.HOMEPATH, '.kenote_scaffolds')

exports.update = () => {
  let options = null
  const scaffolds = _.map(config.scaffoldSetting, 'name')
  return inquirer.prompt(scaffoldQuest(scaffolds))
    .then( answers => {
      options = answers
      let currentScaffold = _.find(config.scaffoldSetting, { name: options.scaffold })
      let versions = currentScaffold.versions
      return inquirer.prompt(vserionQuest(versions))
    })
    .then( answers => {
      options = Object.assign(options, answers)
      return downloadScaffold(options)
    })
    .then( ret => {
      console.log(`\n    scaffold [${options.scaffold} ${options.version}] update sccuess!\n`)
    })
}

exports.install = () => {
  let options = null
  const scaffolds = _.map(config.scaffoldSetting, 'name')
  return inquirer.prompt(packageQuest)
    .then( answers => {
      options = { package: answers }
      return inquirer.prompt(scaffoldQuest(scaffolds))
    })
    .then( answers => {
      options = Object.assign(options, answers)
      let currentScaffold = _.find(config.scaffoldSetting, { name: options.scaffold })
      let versions = currentScaffold.versions
      return inquirer.prompt(vserionQuest(versions))
    })
    .then( answers => {
      options = Object.assign(options, answers)
      let scaffoldDir = path.resolve(scaffoldPath, options.scaffold, options.version)
      if (fs.existsSync(scaffoldDir)) {
        return copyScaffold(scaffoldDir, base.__BASEDIR, options)
      }
      else {
        console.log(`\n    scaffold [${options.scaffold}@${options.version}] not update!\n`)
        process.exit(0)
      }
    })
    .then( ret => {
      console.log(`\n    scaffold [${options.scaffold}] install sccuess!\n`)
    })
}

const downloadScaffold = (opts) => {
  let dir = path.resolve(scaffoldPath, opts.scaffold, opts.version)
  let repo = _.find(config.scaffoldSetting, { name: opts.scaffold }).repo
  let branch = opts.version === 'latest' ? '' : ` -b ${opts.version}`
  let bash = `rm -rf ${dir}/* && rm -rf ${dir}`
    + ` && git clone${branch} ${repo} ${dir} --separate-git-dir ${scaffoldPath}/.baserc`
    + ` && rm -rf ${scaffoldPath}/.baserc`
    + ` && rm -rf ${dir}/LICENSE ${dir}/README.md ${dir}/.gitignore ${dir}/.git`
  return runscript(bash)
}

const copyScaffold = (tpl, dest, options) => {
  let pkgDir = path.resolve(dest, 'package.json')
  return fs.exists(pkgDir)
    .then( ret => {
      if (ret) {
        console.log(`\n    scaffold [${options.scaffold}] already installed!\n`)
        process.exit(0)
      }
      else {
        return fs.copy(tpl, dest)
      }
    })
    .then( ret => {
      let pkg = fs.readFileSync(path.resolve(dest, 'package.json'), { encoding: 'utf-8'})
      let data = _.assign(JSON.parse(pkg), options.package)
      fs.writeFileSync(path.resolve(dest, 'package.json'), JSON.stringify(data, null, 2), { encoding: 'utf-8'})
      return runscript(`npm i`)
    })
}