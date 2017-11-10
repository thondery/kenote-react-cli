
module.exports = (info) => [
  {
    type: 'list',
    name: 'version',
    message: 'select a version:',
    choices: info,
  },
]