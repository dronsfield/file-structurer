import * as fs from 'fs'
import * as pathLib from 'path'

function readFile(props: { path: string }) {
  const { path } = props
  return fs.readFileSync(path, { encoding: 'utf8' })
}

function deleteFile(props: { path: string }) {
  const { path } = props
  return fs.unlinkSync(path)
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

function compileTemplate(input: string, data: { [key: string]: string } = {}) {
  const compiled = input.replace(
    /{{([\s\S]+?)}}/g,
    (match: string, key: string) => {
      return data[key] || ''
    }
  )
  return compiled
}

function compileTemplateFile(path: string, data?: { [key: string]: string }) {
  try {
    const template = readFile({ path })
    const compiled = compileTemplate(template, data)
    return compiled
  } catch (err) {
    console.log('compileTemplate failed', err && err.message)
    return ''
  }
}

function getTemplatePath(fileName: string) {
  return pathLib.join(__dirname, `../templates/${fileName}.template`)
}
const defaultTemplates: { [key: string]: string } = {
  '{{name}}.{{ext}}': getTemplatePath('component.{{ext}}'),
  '{{name}}.spec.{{ext}}': getTemplatePath('test'),
  'index.{{ext}}': getTemplatePath('index')
}
const defaultMainFile = '{{name}}.{{ext}}'

function createComponentFolder(props: {
  path: string
  name: string
  ext: string
  mainFileData?: string
  templates?: { [key: string]: string }
  mainFile?: string
}) {
  let {
    path,
    name,
    ext,
    mainFileData,
    templates = defaultTemplates,
    mainFile = defaultMainFile
  } = props

  if (ext.startsWith('.')) ext = ext.slice(1)
  const templateData = { name, ext }

  const newFolderPath = pathLib.join(path, name)
  newFolder({ path: newFolderPath })

  const output = {
    paths: { mainFile: '', other: [] as string[] }
  }

  Object.keys(templates).forEach((fileName) => {
    const isMainFile = fileName === mainFile
    const compiledFileName = compileTemplate(fileName, templateData)
    const templatePath = templates[fileName]
    const compiledTemplatePath = compileTemplate(templatePath, templateData)
    const newFilePath = pathLib.join(newFolderPath, compiledFileName)
    const newFileData =
      isMainFile && mainFileData
        ? mainFileData
        : compileTemplateFile(compiledTemplatePath, templateData)
    newFile({ path: newFilePath, data: newFileData })
    if (isMainFile) {
      output.paths.mainFile = newFilePath
    } else {
      output.paths.other.push(newFilePath)
    }
  })

  return output
}

function convertFileToFolder(props: { path: string; deleteFile?: boolean }) {
  const { path, deleteFile: deleteFileProp } = props

  const ext = pathLib.extname(path)
  const name = pathLib.basename(path, ext)
  const dir = pathLib.dirname(path)

  const mainFileData = ascendImports(readFile({ path }).split('\n')).join('\n')

  const output = createComponentFolder({ path: dir, name, ext, mainFileData })
  if (deleteFileProp) deleteFile({ path })
  return output
}

export { createComponentFolder, convertFileToFolder }
