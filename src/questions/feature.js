
module.exports = [
  {
    type: 'input',
    name: 'route',
    message: 'route',
    default: '/',
    validate: validRoute.bind(this)
  },
  {
    type: 'input',
    name: 'showName',
    message: 'showName',
  },
]

function validRoute (value) {
  if (/(^\/)([a-z0-9\/\-])/.test(value) || /^\//.test(value)) {
    return true
  }
  return `route wrong format！`
}