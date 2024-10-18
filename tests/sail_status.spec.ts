import { test } from '@japa/runner'
import sinon from 'sinon'
import type { ApplicationService } from '@adonisjs/core/types'

import DockerComposeRunner from '../src/docker_compose_runner.js'
import SailStatus from '../commands/sail_status.js'
import { createApp } from './helpers/index.js'

test.group('Sail Stop', (group) => {
  let app: ApplicationService

  group.each.setup(async () => {
    app = await createApp()
  })

  group.each.teardown(() => {
    sinon.restore()
  })

  test('collect status of running services', async ({ assert }) => {
    const psStub = sinon.stub(DockerComposeRunner.prototype, 'ps').resolves({
      exitCode: 0,
      services: [{ name: 'mysql', state: 'running', ports: '3306:3306' }],
    })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStatus, [])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertTableRows([['mysql', 'running', '3306:3306']])

    assert.isTrue(psStub.calledOnce)
  })

  test('message when no running services', async ({ assert }) => {
    const psStub = sinon.stub(DockerComposeRunner.prototype, 'ps').resolves({
      exitCode: 0,
      services: [],
    })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStatus, [])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertLogMatches(/Services not started/)

    assert.isTrue(psStub.calledOnce)
  })

  test('error on fail to collect status', async ({ assert }) => {
    const psStub = sinon
      .stub(DockerComposeRunner.prototype, 'ps')
      .rejects({ exitCode: 1, out: '', err: 'error' })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStatus, [])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertFailed()
    command.assertExitCode(1)
    command.assertLogMatches(/error/)

    assert.isTrue(psStub.calledOnce)
  })
})
