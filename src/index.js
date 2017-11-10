exports.redux = require('./redux')
exports.component = require('./component')
exports.feature = require('./feature')
exports.config = require('./config')
exports.scaffold = require('./scaffold')

exports.scaffoldOptions = {
  ['admin']: 'https://github.com/thondery/kenote-react-admin.git',
  ['base']: 'https://github.com/thondery/kenote-react-base.git',
  ['component']: 'https://github.com/thondery/kenote-react-component.git'
}

exports.scaffoldSetting = [
  {
    name: 'kenote-react-base',
    repo: 'https://github.com/thondery/kenote-react-base.git',
    versions: [
      '1.0.0',
      '1.1.0',
      'latest'
    ],
    default: 'latest'
  },
  {
    name: 'kenote-react-redux-base',
    repo: 'https://github.com/thondery/kenote-react-redux-base.git',
    versions: [
      '1.0.0',
      'latest'
    ],
    default: 'latest'
  },
  {
    name: 'kenote-react-component',
    repo: 'https://github.com/thondery/kenote-react-component.git',
    versions: [
      '1.0.0',
      'latest'
    ],
    default: 'latest'
  },
]