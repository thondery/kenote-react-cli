const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const { mounts } = require('kenote-mount')
const base = require('./base')

const { 
  rootQuest,
  nameQuest,
  componentQuest,
  listQuest,
} = mounts(path.resolve(__dirname, './questions'), 'quest')

exports.add = () => {
  let options = null
  return inquirer.prompt(rootQuest('./src/components'))
    .then( answers => {
      options = answers
      return inquirer.prompt(nameQuest(options.root))
    })
    .then( answers => {
      options = Object.assign(options, answers)
      return inquirer.prompt(componentQuest)
    })
    .then( answers => {
      options = Object.assign(options, answers)
      base.createRoot(`${options.root}/${options.name}`)
      createComponent(options.name, options.root, options.type)
      createStyle(options.name, options.root, options.type)
      createRootIndex(options.name, options.root)
      console.log(`\n    component add ${options.name} sccuess!\n`)
    })
}

exports.remove = () => {
  let options = null
  return inquirer.prompt(rootQuest('./src/components'))
    .then( answers => {
      options = answers
      let lists = getComponents(options.root)
      if (lists.length === 0) {
        console.log(`\n    not components!\n`)
        return { exit: true }
      }
      else {
        return inquirer.prompt(listQuest('name', 'What component do you need remove?', lists))
      }
    })
    .then( answers => {
      if (answers.exit) {

      }
      else {
        options = Object.assign(options, answers)
        let name = _.kebabCase(options.name)
        removeRootIndex(name, options.root)
        removeComponent(`${options.root}/${name}`)
        console.log(`\n    component remove ${options.name} sccuess!\n`)
      }
    })
}

const createComponent = (name, dir, type) => {
  let Container = type === 'react-native' ? 'View' : 'div'
  let data = `${base.fileHeader(`Component -- ${_.upperFirst(_.camelCase(name))}`)}`
    + `import React, { PureComponent } from 'react'\n`
    + `import PropTypes from 'prop-types'\n`
    + `${getHeadImport(type)}`
    + `\n`
    + `export default class ${_.upperFirst(_.camelCase(name))} extends PureComponent {\n`
    + `  \n`
    + `  static propTypes = {\n`
    + `    \n`
    + `  }\n`
    + `  \n`
    + `  static defaultProps = {\n`
    + `    \n`
    + `  }\n`
    + `  \n`
    + `  render() {\n`
    + `    return (\n`
    + `      <${Container}>\n`
    + `        \n`
    + `      </${Container}>\n`
    + `    )\n`
    + `  }\n`
    + `}`
  fs.writeFileSync(path.resolve(base.__BASEDIR, dir, name, 'index.js'), data, { encoding: 'utf-8' })
}

const createStyle = (name, dir, type) => {
  let fileName = type === 'react-native' ? `style.js` : `style.scss`
  let data = ``
  if (type === 'react-native') {
    data = `import { StyleSheet, Dimensions, Platform } from 'react-native'\n`
      + `export const { width, height } = Dimensions.get('window')\n`
      + `\n`
      + `export default StyleSheet.create({\n`
      + `  container: {\n`
      + `    \n`
      + `  }\n`
      + `})\n`
  }
  else {
    data = `${base.fileHeader('Sass Style')}`
  }
  fs.writeFileSync(path.resolve(base.__BASEDIR, dir, name, fileName), data, { encoding: 'utf-8' })
}



const createRootIndex = (name, dir) => {
  let fileDir = path.resolve(base.__BASEDIR, dir, 'index.js')
  let data = ``
  if (fs.existsSync(fileDir)) {
    let info = fs.readFileSync(fileDir, { encoding: 'utf-8' })
    let actionArr = []
    let reducerArr = []
    let nameArr = []
    for (let e of info.split(/\n/)) {
      if (/^export\s+\{\s+default/.test(e)) {
        nameArr.push(e)
      }
    }
    nameArr.push(`export { default as ${_.upperFirst(_.camelCase(name))} } from './${name}'`)
    let arr = _.uniq(nameArr)
    for (let e of arr) {
      data += `${e}\n`
    }
  }
  else {
    data = ``
      + `export { default as ${_.upperFirst(_.camelCase(name))} } from './${name}'\n`
  }
  fs.writeFileSync(fileDir, data, { encoding: 'utf-8' })
}

const removeRootIndex = (name, dir) => {
  let fileDir = path.resolve(base.__BASEDIR, dir, 'index.js')
  let data = ``
  if (fs.existsSync(fileDir)) {
    let info = fs.readFileSync(fileDir, { encoding: 'utf-8' })
    let nameArr = []
    for (let e of info.split(/\n/)) {
      if (/^export\s+\{\s+default/.test(e)) {
        e.match(/\.\/(\S*)\'/)[1] !== name && nameArr.push(e)
      }
    }
    let arr = _.uniq(nameArr)
    for (let e of arr) {
      data += `${e}\n`
    }
    fs.writeFileSync(fileDir, data, { encoding: 'utf-8' })
  }
}

const removeComponent = (dir) => {
  fs.removeSync(path.resolve(base.__BASEDIR, dir))
}

const getHeadImport = (type) => {
  let data = null
  if (type === 'react-native') {
    data = `import {\n`
      + `  View,\n`
      + `  ViewPropTypes,\n`
      + `} from 'react-native'\n`
      + `import styles, { width, height } from './style'\n`
  }
  else {
    data = `import './style.scss'\n`
  }
  return data
}

const getComponents = (root) => {
  let dir = path.resolve(base.__BASEDIR, root)
  let arr = []
  if (!fs.existsSync(dir)) return arr
  let components = fs.readdirSync(dir)
  for (let e of components) {
    try {
      !fs.ensureDirSync(path.resolve(base.__BASEDIR, root, e)) && arr.push(_.upperFirst(_.camelCase(e)))
    } catch (error) {
      
    }
  }
  return arr
}