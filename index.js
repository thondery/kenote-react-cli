const program = require('commander')
const _ = require('lodash')
const pkg = require('./package.json')
const version = pkg.version
const { redux, component } = require('./src')

program
  .version(version)

program
  .name('node-react')
  .usage('[command] [options]')
  
program
  .command('redux')
  .option('-a, --add ', 'add redux ...')
  .option('-r, --remove ', 'remove redux ...')
  .description('redux toolkit ...')
  .action( () => {
    if (program.args[0].add) {
      redux.add()
    }
    else if (program.args[0].remove) {
      redux.remove()
    }
    else {
      var opts = _.last(program.args).options
      var desc = _.last(program.args)._description
      help('redux [options]', desc, opts)
    }
  })
  
program
  .command('component')
  .option('-a, --add ', 'add component ...')
  .option('-r, --remove ', 'remove component ...')
  .description('component toolkit ...')
  .action( () => {
    if (program.args[0].add) {
      component.add()
    }
    else if (program.args[0].remove) {
      component.remove()
    }
    else {
      var opts = _.last(program.args).options
      var desc = _.last(program.args)._description
      help('component [options]', desc, opts)
    }
  })


// Parse and fallback to help if no args
if (_.isEmpty(program.parse(process.argv).args) && process.argv.length === 2) {
  program.help()
}

function outOption(flags, len, description) {
  var str = flags
  for (var i = flags.length; i < len; i++) {
    str += ' '
  }
  return `    ${str}  ${description}`
}

function help(usage, description, options) {
  console.log(`\n` +
              `  Usage: ${usage}\n\n` +
              `  ${description}\n\n` +
              `  Options:\n`)
  const flags = _.map(options, 'flags').sort( (a, b) => b.length - a.length )
  const maxlength = options.length > 0 ? flags[0].length : '-h, --help'.length
  //console.log(outOption('-h, --help2', maxlength, 'output usage information'))
  options.map( opt => {
    console.log(outOption(opt.flags, maxlength, opt.description))
  })
  console.log('\r')
}