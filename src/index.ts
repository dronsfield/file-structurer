import * as fs from 'fs'
import * as pathLib from 'path'

function editFile(props: {
  path: string
  transform: (input: string[]) => string[]
  outputPath?: string
}) {
  const { path, transform, outputPath } = props

  const originalData = fs.readFileSync(path, { encoding: 'utf8' })
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

function convertFileToFolder(props: { path: string }) {
  const { path } = props

  const ext = pathLib.extname(path)
  const baseName = pathLib.basename(path, ext)
  const dir = pathLib.dirname(path)

  const newFolderPath = pathLib.join(dir, baseName)
  const indexFilePath = pathLib.join(newFolderPath, 'index') + ext
  const mainFilePath = pathLib.join(newFolderPath, baseName) + ext
  const testFilePath = pathLib.join(newFolderPath, baseName) + '.spec' + ext

  newFolder({ path: newFolderPath })
  newFile({ path: indexFilePath })
  editFile({ path, transform: ascendImports, outputPath: mainFilePath })
  newFile({ path: testFilePath })

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
