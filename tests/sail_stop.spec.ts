import { test } from '@japa/runner'
import sinon from 'sinon'
import type { ApplicationService } from '@adonisjs/core/types'

import DockerComposeRunner from '../src/docker_compose_runner.js'
import SailStop from '../commands/sail_stop.js'
import { createApp } from './helpers/index.js'

test.group('Sail Stop', (group) => {
  let app: ApplicationService

  group.each.setup(async () => {
    app = await createApp()
  })

  group.each.teardown(() => {
    sinon.restore()
  })

  test('stop all services', async ({ assert }) => {
    const downStub = sinon
      .stub(DockerComposeRunner.prototype, 'down')
      .resolves({ exitCode: 0, out: '', err: '' })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStop, [])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertLogMatches(/Stoping services/)
    command.assertLogMatches(/Services stoped/)

    assert.isTrue(downStub.calledOnceWith(sinon.match.typeOf('undefined')))
  })

  test('stop one or many services', async ({ assert }) => {
    const downStub = sinon
      .stub(DockerComposeRunner.prototype, 'down')
      .resolves({ exitCode: 0, out: '', err: '' })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStop, ['mysql'])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertSucceeded()
    command.assertExitCode(0)
    command.assertLogMatches(/Stoping services/)
    command.assertLogMatches(/Services stoped/)

    assert.isTrue(downStub.calledOnceWith(sinon.match(['mysql'])))
  })

  test('error on fail to stop', async ({ assert }) => {
    const downStub = sinon
      .stub(DockerComposeRunner.prototype, 'down')
      .rejects({ exitCode: 1, out: '', err: 'no such service' })

    const ace = await app.container.make('ace')
    const command = await ace.create(SailStop, ['mysql'])
    command.ui.switchMode('raw')

    await command.exec()

    command.assertFailed()
    command.assertExitCode(1)
    command.assertLogMatches(/Stoping services/)
    command.assertLogMatches(/no such service/)

    assert.isTrue(downStub.calledOnceWith(sinon.match(['mysql'])))
  })
})
