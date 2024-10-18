import { test } from '@japa/runner'
import sinon from 'sinon'
import type { ApplicationService } from '@adonisjs/core/types'

import DockerComposeRunner from '../src/docker_compose_runner.js'
import SailStart from '../commands/sail_start.js'
import { createApp } from './helpers/index.js'

test.group('Sail Start', (group) => {
  let app: ApplicationService

  group.each.setup(async () => {
    app = await createApp()
  })

  group.each.teardown(() => {
    sinon.restore()
  })

  test('start all services', async ({ assert }) => {
    const upStub = sinon
      .stub(DockerComposeRunner.prototype, 'up')
      .resolves({ exitCode: 0, out: '', err: '' })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStart, [])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertLogMatches(/Starting services/)
    command.assertLogMatches(/Services started/)

    assert.isTrue(upStub.calledOnceWith(sinon.match.typeOf('undefined'), sinon.match.string))
  })

  test('start one or many services', async ({ assert }) => {
    const upStub = sinon
      .stub(DockerComposeRunner.prototype, 'up')
      .resolves({ exitCode: 0, out: '', err: '' })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStart, ['mysql'])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertLogMatches(/Starting services/)
    command.assertLogMatches(/Services started/)

    assert.isTrue(upStub.calledOnceWith(sinon.match(['mysql']), sinon.match.string))
  })

  test('error on fail to start', async ({ assert }) => {
    const upStub = sinon
      .stub(DockerComposeRunner.prototype, 'up')
      .rejects({ exitCode: 1, out: '', err: 'no such service' })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStart, ['mysql'])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertFailed()
    command.assertExitCode(1)
    command.assertLogMatches(/Starting services/)
    command.assertLogMatches(/no such service/)

    assert.isTrue(upStub.calledOnceWith(sinon.match(['mysql']), sinon.match.string))
  })
})
