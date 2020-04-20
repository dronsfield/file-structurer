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

function createComponentFolder(props: {
  path: string
  name: string
  ext: string
  mainFileData?: string
}) {
  let { path, name, ext, mainFileData } = props

  const newFolderPath = pathLib.join(path, name)
  const indexFilePath = pathLib.join(newFolderPath, 'index') + ext
  const mainFilePath = pathLib.join(newFolderPath, name) + ext
  const testFilePath = pathLib.join(newFolderPath, name) + '.spec' + ext

  const indexFileData = compileTemplate({
    name: 'index',
    data: { name }
  })
  const testFileData = compileTemplate({
    name: 'test',
    data: { name }
  })

  if (!mainFileData) {
    if (ext === 'tsx' || ext === 'jsx') {
      mainFileData = compileTemplate({
        name: `component.${ext}`,
        data: { name }
      })
    }
  }

  newFolder({ path: newFolderPath })
  newFile({ path: indexFilePath, data: indexFileData })
  newFile({ path: mainFilePath, data: mainFileData })
  newFile({ path: testFilePath, data: testFileData })

  return {
    paths: {
      newFolder: newFolderPath,
      indexFile: indexFilePath,
      mainFile: mainFilePath,
      testFile: testFilePath
    },
    data: {
      indexFile: indexFileData,
      mainFile: mainFileData,
      testFile: testFileData
    }
  }
}

function convertFileToFolder(props: { path: string }) {
  const { path } = props

  const ext = pathLib.extname(path)
  const name = pathLib.basename(path, ext)
  const dir = pathLib.dirname(path)

  const mainFileData = ascendImports(readFile({ path }).split('\n')).join('\n')

  return createComponentFolder({ path: dir, name, ext, mainFileData })
}

export default convertFileToFolder
