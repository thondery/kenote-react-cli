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
  featureQuest,
  listQuest,

} = mounts(path.resolve(__dirname, './questions'), 'quest')



exports.add = () => {
  let options = null
  return inquirer.prompt(rootQuest('./src/features'))
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
      return options.type !== 'react-native' ? inquirer.prompt(featureQuest) : null
    })
    .then( answers => {
      options = Object.assign(options, answers)
      base.createRoot(`${options.root}/${options.name}`)
      createComponent(options.name, options.root, options.type)
      createStyle(options.name, options.root, options.type)
      createIndex(options)
      createRootIndex(options.name, options.root, options.type)
      console.log(`\n    feature add ${options.name} sccuess!\n`)
    })
}

exports.remove = () => {
  let options = null
  return inquirer.prompt(rootQuest('./src/features'))
    .then( answers => {
      options = answers
      let lists = getFeatures(options.root)
      if (lists.length === 0) {
        console.log(`\n    not features!\n`)
        return { exit: true }
      }
      else {
        return inquirer.prompt(listQuest('name', 'What feature do you need remove?', lists))
      }
    })
    .then( answers => {
      if (answers.exit) {

      }
      else {
        options = Object.assign(options, answers)
        let name = _.kebabCase(options.name)
        removeRootIndex(name, options.root)
        removeFeature(`${options.root}/${name}`)
        console.log(`\n    component remove ${options.name} sccuess!\n`)
      }
    })
}

const createComponent = (name, dir, type) => {
  let Container = type === 'react-native' ? 'View' : 'div'
  let data = `${base.fileHeader(`Screen -- ${_.upperFirst(_.camelCase(name))}`)}`
    + `import React, { PureComponent } from 'react'\n`
    + `import PropTypes from 'prop-types'\n`
    + `${getHeadImport(type)}`
    + `\n`
    + `export default class ${_.upperFirst(_.camelCase(name))} extends PureComponent {\n`
    + `  \n`
    + `  constructor (props) {\n`
    + `    super(props)\n`
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
  fs.writeFileSync(path.resolve(base.__BASEDIR, dir, name, 'screen.js'), data, { encoding: 'utf-8' })
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

const createIndex = (opts) => {
  let data = ``
  if (opts.type === 'react-native') {
    data = `export { default as Screen } from './screen'\n`
  }
  else {
    data = `import Screen from './screen'\n`
      + `\n`
      + `const routes = {\n`
      + `  path: '${opts.route}',\n`
      + `  name: '${opts.showName}',\n`
      + `  childRoutes: [\n`
      + `    { path: 'default', name: '${opts.showName}', component: Screen, isIndex: true },\n`
      + `  ],\n`
      + `}\n`
      + `\n`
      + `export default routes`
  }
  fs.writeFileSync(path.resolve(base.__BASEDIR, `${opts.root}/${opts.name}`, 'index.js'), data, { encoding: 'utf-8' })
}

const createRootIndex = (name, dir, type) => {
  let fileDir = path.resolve(base.__BASEDIR, dir, 'index.js')
  let data = type === 'react-native' 
    ? getRootIndexNative(name, fileDir) 
    : getRootIndex(name, fileDir)
  fs.writeFileSync(fileDir, data, { encoding: 'utf-8' })
}

const removeRootIndex = (name, dir, type) => {
  let fileDir = path.resolve(base.__BASEDIR, dir, 'index.js')
  if (!fs.existsSync(fileDir)) return
  let info = fs.readFileSync(fileDir, { encoding: 'utf-8' })
  let data = /Routes/.test(info)
    ? getRootIndex(name, fileDir, true)
    : getRootIndexNative(name, fileDir, true)
  fs.writeFileSync(fileDir, data, { encoding: 'utf-8' })
}

const getRootIndexNative = (name, dir, remove = false) => {
  let data = ``
  if (fs.existsSync(dir)) {
    let info = fs.readFileSync(dir, { encoding: 'utf-8' })
    let nameArr = []
    for (let e of info.split(/\n/)) {
      if (/^export\s+\{\s+Screen/.test(e)) {
        (e.match(/\.\/(\S*)\'/)[1] !== name || !remove) && nameArr.push(e)
      }
    }
    !remove && nameArr.push(`export { Screen as ${_.upperFirst(_.camelCase(`${name}Screen`))} } from './${name}'`)
    let arr = _.uniq(nameArr)
    for (let e of arr) {
      data += `${e}\n`
    }
  }
  else {
    data = ``
      + `export { Screen as ${_.upperFirst(_.camelCase(`${name}Screen`))} } from './${name}'\n`
  }
  return data
}

const getRootIndex = (name, dir, remove = false) => {
  let data = ``
  if (fs.existsSync(dir)) {
    let info = fs.readFileSync(dir, { encoding: 'utf-8' })
    let screenArr = []
    let nameArr = []
    for (let e of info.split(/\n/)) {
      if (/^import\s+/.test(e)) {
        if (e.match(/\.\/(\S*)\'/)[1] !== name || !remove) {
          screenArr.push(e)
          nameArr.push(e.match(/\.\/(\S*)\'/)[1])
        }
      }
    }
    !remove && screenArr.push(`import ${_.upperFirst(_.camelCase(name))} from './${name}'`)
    !remove && nameArr.push(name)
    let arr = _.uniq(screenArr)
    for (let e of arr) {
      data += `${e}\n`
    }
    data += `${getRoutes(nameArr)}`
  }
  else {
    data = ``
      + `import ${_.upperFirst(_.camelCase(name))} from './${name}'\n`
      + `\n`
      + `export const Routes = [\n`
      + `  ${_.upperFirst(_.camelCase(name))},\n`
      + `]`
  }
  return data
}

const getRoutes = (arr) => {
  let routes = ``
  for (let e of _.uniq(arr)) {
    routes += `  ${_.upperFirst(_.camelCase(e))},\n`
  }
  let data = `\n`
  + `export const Routes = [\n`
  + `${routes}`
  + `]`
  return data
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

const getFeatures = (root) => {
  let dir = path.resolve(base.__BASEDIR, root)
  let arr = []
  if (!fs.existsSync(dir)) return arr
  let features = fs.readdirSync(dir)
  for (let e of features) {
    try {
      !fs.ensureDirSync(path.resolve(base.__BASEDIR, root, e)) && arr.push(_.upperFirst(_.camelCase(e)))
    } catch (error) {
      
    }
  }
  return arr
}

const removeFeature = (dir) => {
  fs.removeSync(path.resolve(base.__BASEDIR, dir))
}