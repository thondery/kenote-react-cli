const program = require('commander')
const _ = require('lodash')
const pkg = require('./package.json')
const version = pkg.version
const { redux } = require('./src')

program
  .version(version)

program
  .name('node-react')
  .usage('[command] [options]')
  
program
  .command('redux')
  .option('-a, --add ', 'add redux ...')
  .option('-r, --remove ', 'add redux ...')
  .description('redux toolkit ...')
  .action( () => {
    if (program.args[0].add) {
      redux.add()
    }
    if (program.args[0].remove) {
      redux.remove()
    }
  })


// Parse and fallback to help if no args
if (_.isEmpty(program.parse(process.argv).args) && process.argv.length === 2) {
  program.help()
}