const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const pattern = os.platform() === 'win32' ? /^([a-zA-Z]{1}\:\\)/ : /^(\/{1})/

// 当前路径
exports.__BASEDIR = process.cwd()

// 获取当前目录名
exports.getBaseName = (dest = this.__BASEDIR) => dest.replace(/(.*\/)*([^.]+)/ig, '$2')

// 获取目标路径
exports.getTargetInfo = (target) => {
  const dir = pattern.test(target) ? target : path.resolve(this.__BASEDIR, target.replace(/\s/g, '_'))
  const exists = fs.existsSync(dir)
  let empty = true
  let message = null
  let failure = null
  if (exports) {
    try {
      empty = fs.readdirSync(dir).length === 0
      //if (!empty) message = 'A destination is not an empty directory.'
    } catch (error) {
      //empty = false
      failure = 'A destination is not a directory.'
    }
  }
  return { dir, exists, empty, failure }
}

// 创建主目录
exports.createRoot = (target) => {
  let dir = path.resolve(this.__BASEDIR, target)
  !fs.existsSync(dir) && fs.mkdirpSync(dir)
}

// 设置文件头注释
exports.fileHeader = (name) => {
  let data = `// ------------------------------------\n`
    + `// ${name}\n`
    + `// ------------------------------------\n`
  return data
}