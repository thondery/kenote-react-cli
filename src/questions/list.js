
module.exports = (name, message, list) =>[
  {
    type: 'list',
    name: name,
    message: message,
    choices: list,
  },
]