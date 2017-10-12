const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const { mounts } = require('kenote-mount')
const base = require('./base')

const { 
  rootQuest,
  nameQuest
} = mounts(path.resolve(__dirname, './questions'), 'quest')

exports.add = () => {
  let options = null
  return inquirer.prompt(rootQuest('./src/redux'))
    .then( answers => {
      options = answers
      return inquirer.prompt(nameQuest(options.root))
    })
    .then( answers => {
      options = Object.assign(options, answers)
      base.createRoot(`${options.root}/${options.name}`)
      createConstant(`${options.root}/${options.name}`)
      createAction(`${options.root}/${options.name}`)
      createReducer(`${options.root}/${options.name}`)
      createIndex(`${options.root}/${options.name}`)
      createRootIndex(options.name, options.root)
      console.log(`\n    redux add ${options.name} sccuess!\n`)
    })
}

exports.remove = () => {
  let options = null
  return inquirer.prompt(rootQuest('./src/redux'))
    .then( answers => {
      options = answers
      return inquirer.prompt(nameQuest(options.root, true))
    })
    .then( answers => {
      options = Object.assign(options, answers)
      removeRootIndex(options.name, options.root)
      removeRedux(`${options.root}/${options.name}`)
      console.log(`\n    redux remove ${options.name} sccuess!\n`)
    })
}

const createAction = (dir) => {
  let data = `${base.fileHeader('Actions')}`
    + `import { createAction } from 'http-services'\n`
    + `import * as types from './constant'\n`
  fs.writeFileSync(path.resolve(base.__BASEDIR, dir, 'action.js'), data, { encoding: 'utf-8' })
}

const createConstant = (dir) => {
  let data = `${base.fileHeader('Constants')}`
  fs.writeFileSync(path.resolve(base.__BASEDIR, dir, 'constant.js'), data, { encoding: 'utf-8' })
}

const createReducer = (dir) => {
  let data = `${base.fileHeader('Reducer')}`
    + `import { createReducer, statusToError, getStatusError } from 'http-services'\n`
    + `import * as types from './constant'\n`
    + `\n`
    + `const initState = {\n`
    + `  \n`
    + `}\n`
    + `\n`
    + `const ACTION_HANDLERS = {\n`
    + `  \n`
    + `}\n`
    + `\n`
    + `export default (state = initState, action) => createReducer(state, action, ACTION_HANDLERS)`
  fs.writeFileSync(path.resolve(base.__BASEDIR, dir, 'reducer.js'), data, { encoding: 'utf-8' })
}

const createIndex = (dir) => {
  let data = ``
    + `import * as actions from './action'\n`
    + `export { default as Reducer } from './reducer'\n`
    + `export { actions }`
  fs.writeFileSync(path.resolve(base.__BASEDIR, dir, 'index.js'), data, { encoding: 'utf-8' })
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
      if (/^export\s+\{\s+actions/.test(e)) {
        actionArr.push(e)
      }
      if (/^import\s+\{\s+Reducer/.test(e)) {
        reducerArr.push(e)
        nameArr.push(e.match(/\.\/(\S*)\'/)[1])
      }
    }
    actionArr.push(`export { actions as ${_.camelCase(`${name}Actions`)} } from './${name}'`)
    reducerArr.push(`import { Reducer as ${_.camelCase(`${name}Reducer`)} } from './${name}'`)
    nameArr.push(name)
    let arr = _.uniq(_.concat(actionArr, reducerArr))
    for (let e of arr) {
      data += `${e}\n`
    }
    data += `${getReducers(nameArr)}`
  }
  else {
    data = ``
      + `export { actions as ${_.camelCase(`${name}Actions`)} } from './${name}'\n`
      + `import { Reducer as ${_.camelCase(`${name}Reducer`)} } from './${name}'\n`
      + `\n`
      + `export const Reducers = {\n`
      + `  ${_.upperFirst(name)}: ${_.camelCase(`${name}Reducer`)}\n`
      + `}`
    
  }
  fs.writeFileSync(fileDir, data, { encoding: 'utf-8' })
}

const removeRootIndex = (name, dir) => {
  let fileDir = path.resolve(base.__BASEDIR, dir, 'index.js')
  let data = ``
  if (fs.existsSync(fileDir)) {
    let info = fs.readFileSync(fileDir, { encoding: 'utf-8' })
    let actionArr = []
    let reducerArr = []
    let nameArr = []
    for (let e of info.split(/\n/)) {
      if (/^export\s+\{\s+actions/.test(e)) {
        e.match(/\.\/(\S*)\'/)[1] !== name && actionArr.push(e)
      }
      if (/^import\s+\{\s+Reducer/.test(e)) {
        e.match(/\.\/(\S*)\'/)[1] !== name && reducerArr.push(e)
        e.match(/\.\/(\S*)\'/)[1] !== name && nameArr.push(e.match(/\.\/(\S*)\'/)[1])
      }
    }
    let arr = _.uniq(_.concat(actionArr, reducerArr))
    for (let e of arr) {
      data += `${e}\n`
    }
    data += `${getReducers(nameArr)}`
    fs.writeFileSync(fileDir, data, { encoding: 'utf-8' })
  }
}

const removeRedux = (dir) => {
  fs.removeSync(path.resolve(base.__BASEDIR, dir))
}

const getReducers = (arr) => {
  let reducers = ``
  for (let e of _.uniq(arr)) {
    reducers += `  ${_.upperFirst(e)}: ${_.camelCase(`${e}Reducer`)},\n`
  }
  let data = `\n`
  + `export const Reducers = {\n`
  + `${reducers}`
  + `}`
  return data
}