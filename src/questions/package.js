const base = require('../base')

module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'name:',
    default: base.getBaseName()
  },
  {
    type: 'input',
    name: 'version',
    message: 'version:',
    default: '1.0.0'
  },
  {
    type: 'input',
    name: 'description',
    message: 'description:',
  },
  {
    type: 'input',
    name: 'repository',
    message: 'repository:'
  },
  {
    type: 'input',
    name: 'author',
    message: 'author:'
  },
  {
    type: 'input',
    name: 'license',
    message: 'license:',
    default: 'MIT'
  }
]