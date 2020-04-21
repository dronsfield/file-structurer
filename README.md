# File Structurer

This package surfaces some utilities for structuring files in javascript projects.

At the moment it's just a couple of functions that are helpful when working with component folders.

Component folders are a familiar pattern in modern javascript development. A common use case is when a component has tests associated with it.

In this package, "component folder" refers to a file structure like the following:

```
├── Button
│   ├── Button.spec.tsx
│   ├── Button.tsx
│   └── index.tsx
├── Card
│   ├── Card.spec.tsx
│   ├── Card.tsx
│   └── index.tsx
```

Check out this [component folder VS Code extension](https://github.com/dronsfield/vscode-component-folder) for an example of this package in action.

## Installation

```sh
npm install file-structurer
```

## Usage

```typescript
import { createComponentFolder, converFileToFolder } from 'file-structurer'
```

## API

### createComponentFolder

Create a component folder.

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| props.path | string | absolute path to containing folder |
| props.name | string | name of component |
| props.ext | string | file extension to be used |
| props.mainFileData | string? | contents of main file |

**Returns**

An object with some details about the created files.

**Example**
```typescript
createComponentFolder({
    path: '/path/to/components/folder',
    name: 'Button',
    ext: 'tsx'
})
```

----------

### convertFileToFolder

Create a component folder from an existing file. Copies the content of the file and fixes the imports to work from within a folder. The new folder will have the same name as the original file and the new files will have the same extension.

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| props.path | string | absolute path to file |
| props.deleteFile | boolean? | if `true`: deletes the original file |

**Returns**

An object with some details about the created files.

**Example**
```typescript
convertFileToFolder({
    path: '/path/to/components/folder/Button',
    deleteFile: true
})
```