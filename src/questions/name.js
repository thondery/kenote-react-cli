const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const base = require('../base')

module.exports = (root, boo = false) => [
  {
    type: 'input',
    name: 'name',
    message: 'name',
    validate: validName.bind(this, root, boo)
  }
]

const validName = (root, boo, value) => {
  if (_.isEmpty(value.replace(/\s+/, ''))) {
    return 'name not isnull'
  }
  let dir = path.resolve(base.__BASEDIR, root, value)
  if (!fs.existsSync(dir) || boo) {
    return true
  }
  return `name already exists`
}