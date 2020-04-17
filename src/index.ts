import * as fs from 'fs'
import * as pathLib from 'path'

function readFile(props: { path: string }) {
  const { path } = props
  return fs.readFileSync(path, { encoding: 'utf8' })
}

function editFile(props: {
  path: string
  transform: (input: string[]) => string[]
  outputPath?: string
}) {
  const { path, transform, outputPath } = props

  const originalData = readFile({ path })
  const transformedData = transform(originalData.split('\n')).join('\n')
  fs.writeFileSync(outputPath || path, transformedData)
}

function newFile(props: { path: string; data?: string }) {
  const { path, data } = props
  fs.writeFileSync(path, data || '')
}

function newFolder(props: { path: string }) {
  const { path } = props
  fs.mkdirSync(path)
}

function ascendImports(lines: string[]): string[] {
  return lines.map((line) => {
    return line
      .replace(`from '../`, `from '../../`)
      .replace(`from "../`, `from "../../`)
      .replace(`from './`, `from '../`)
      .replace(`from "./`, `from "../`)
  })
}

function compileTemplate(props: {
  name: string
  data?: { [key: string]: string }
}) {
  const { name, data = {} } = props
  try {
    const templatePath = pathLib.join(
      __dirname,
      `../templates/${name}.template`
    )
    const template = readFile({
      path: templatePath
    })
    const compiled = template.replace(
      /{{([\s\S]+?)}}/g,
      (match: string, key: string) => {
        return data[key] || ''
      }
    )
    return compiled
  } catch (err) {
    console.log('compileTemplate failed', err && err.message)
    return ''
  }
}

function convertFileToFolder(props: { path: string }) {
  const { path } = props

  const ext = pathLib.extname(path)
  const baseName = pathLib.basename(path, ext)
  const dir = pathLib.dirname(path)

  const newFolderPath = pathLib.join(dir, baseName)
  const indexFilePath = pathLib.join(newFolderPath, 'index') + ext
  const mainFilePath = pathLib.join(newFolderPath, baseName) + ext
  const testFilePath = pathLib.join(newFolderPath, baseName) + '.spec' + ext

  const indexFileData = compileTemplate({
    name: 'index',
    data: { name: baseName }
  })
  const testFileData = compileTemplate({
    name: 'test',
    data: { name: baseName }
  })

  newFolder({ path: newFolderPath })
  newFile({ path: indexFilePath, data: indexFileData })
  editFile({ path, transform: ascendImports, outputPath: mainFilePath })
  newFile({ path: testFilePath, data: testFileData })

  return {
    paths: {
      newFolder: newFolderPath,
      indexFile: indexFilePath,
      mainFile: mainFilePath,
      testFile: testFilePath
    }
  }
}

export default convertFileToFolder
