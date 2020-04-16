import * as fs from 'fs'
import * as pathLib from 'path'

interface Props {
  path: string
}
const foo = (props: Props) => {
  const { path } = props
  console.log({ path })
  console.log('hm')

  const ext = pathLib.extname(path)
  const baseName = pathLib.basename(path, ext)
  const dir = pathLib.dirname(path)

  const newFolder = pathLib.join(dir, baseName)
  const indexFile = pathLib.join(newFolder, 'index') + ext
  const mainFile = pathLib.join(newFolder, baseName) + ext
  const testFile = pathLib.join(newFolder, baseName) + '.spec' + ext

  fs.mkdirSync(newFolder)
  fs.writeFileSync(indexFile, '')
  fs.writeFileSync(mainFile, '')
  fs.writeFileSync(testFile, '')

  return {
    newFolder,
    indexFile,
    mainFile,
    testFile
  }

  // fs.writeFileSync(`${path}.waow`, `wagwan my g`)
}

export default foo
