import { test } from '@japa/runner'
import type { ApplicationService } from '@adonisjs/core/types'

import SailAdd from '../commands/sail_add.js'
import { createApp } from './helpers/index.js'

test.group('Sail Add', (group) => {
  let app: ApplicationService

  group.each.setup(async ({ context: { fs } }) => {
    app = await createApp()
    await fs.create('.env', 'PORT=3333')
  })

  group.each.teardown(async ({ context: { fs } }) => {
    await fs.remove('.env')
  })

  test('generate compose.yml file', async ({ assert, fs }) => {
    const ace = await app.container.make('ace')
    const command = await ace.create(SailAdd, [])
    command.ui.switchMode('raw')

    command.prompt
      .trap('Select services you want to run along your Adonis Application')
      .chooseOptions([0, 3])

    await command.exec()

    command.assertSucceeded()

    await assert.fileExists('compose.yml')
    assert.snapshot(await fs.contents('compose.yml')).match()
    assert.snapshot(await fs.contents('.env')).match()
  })

  test('ask for single database', async ({ assert, fs }) => {
    const ace = await app.container.make('ace')
    const command = await ace.create(SailAdd, ['mysql', 'pgsql'])
    command.ui.switchMode('raw')

    command.prompt
      .trap(
        'Multiple database services selected or installed. Please, select only one database service.'
      )
      .chooseOption(1)

    await command.exec()

    command.assertSucceeded()

    await assert.fileExists('compose.yml')
    assert.snapshot(await fs.contents('compose.yml')).match()
    assert.snapshot(await fs.contents('.env')).match()
  })

  test('fail on unknown service', async ({ assert }) => {
    const ace = await app.container.make('ace')
    const command = await ace.create(SailAdd, ['unknown'])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertFailed()

    command.assertLogMatches(/^Invalid service "unknown"/)

    await assert.fileNotExists('compose.yml')
  })

  test('skip installed services', async ({ assert, fs }) => {
    const ace = await app.container.make('ace')
    const command1 = await ace.create(SailAdd, ['pgsql', 'redis', 'minio'])
    command1.ui.switchMode('raw')

    await command1.exec()

    command1.assertSucceeded()

    const composeFile = await fs.contents('compose.yml')
    const envFile = await fs.contents('.env')

    const command2 = await ace.create(SailAdd, ['minio'])

    await command2.exec()

    command2.assertSucceeded()

    command2.assertLogMatches(/no services to install/)

    assert.equal(await fs.contents('compose.yml'), composeFile)
    assert.equal(await fs.contents('.env'), envFile)
  })
})
