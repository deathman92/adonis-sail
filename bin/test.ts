import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assert } from '@japa/assert'
import { fileSystem } from '@japa/file-system'
import { snapshot } from '@japa/snapshot'
import { configure, processCLIArgs, run } from '@japa/runner'

processCLIArgs(process.argv.splice(2))

configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [
    assert(),
    fileSystem({
      basePath: join(dirname(fileURLToPath(import.meta.url)), '..', 'tests', '__app'),
    }),
    snapshot(),
  ],
})

run()
