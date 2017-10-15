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
  packageQuest
} = mounts(path.resolve(__dirname, './questions'), 'quest')
const scaffoldPath = path.resolve(process.env.HOME || process.env.HOMEPATH, '.kenote_scaffolds')

exports.update = () => {
  let options = null
  const scaffolds = _.keys(config.scaffoldOptions)
  return inquirer.prompt(scaffoldQuest(scaffolds))
    .then( answers => {
      options = answers
      return downloadScaffold(options.scaffold)
    })
    .then( ret => {
      console.log(`\n    scaffold [${options.scaffold}] update sccuess!\n`)
    })
}

exports.install = () => {
  let options = null
  const scaffolds = _.keys(config.scaffoldOptions)
  return inquirer.prompt(packageQuest)
    .then( answers => {
      options = answers
      return inquirer.prompt(scaffoldQuest(scaffolds))
    })
    .then( answers => {
      options = Object.assign(options, answers)
      let scaffoldDir = path.resolve(scaffoldPath, options.scaffold)
      if (fs.existsSync(scaffoldDir)) {
        let opts = _.pick(options, ['name', 'version', 'description', 'repository', 'author', 'license'])
        return copyScaffold(scaffoldDir, base.__BASEDIR, opts)
      }
      else {
        console.log(`\n    scaffold [${options.scaffold}] not update!\n`)
        process.exit(0)
      }
    })
    .then( ret => {
      console.log(`\n    scaffold [${options.scaffold}] install sccuess!\n`)
    })
}

const downloadScaffold = (name) => {
  let dir = path.resolve(scaffoldPath, name)
  let git = config.scaffoldOptions[name]
  let bash = `rm -rf ${dir}/* && rm -rf ${dir}`
    + ` && git clone ${git} ${dir} --separate-git-dir ${scaffoldPath}/.baserc`
    + ` && rm -rf ${scaffoldPath}/.baserc`
    + ` && rm -rf ${dir}/LICENSE ${dir}/README.md ${dir}/.gitignore`
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
      let data = _.assign(JSON.parse(pkg), options)
      fs.writeFileSync(path.resolve(dest, 'package.json'), JSON.stringify(data, null, 2), { encoding: 'utf-8'})
      return runscript(`npm i`)
    })
}