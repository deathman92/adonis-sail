import { test } from '@japa/runner'
import sinon from 'sinon'
import esmock from 'esmock'

import { createApp } from './helpers/index.js'
import type { ApplicationService } from '@adonisjs/core/types'

test.group('DockerComposeRunner', (group) => {
  let app: ApplicationService

  group.each.setup(async ({ context: { fs } }) => {
    app = await createApp()
    await fs.create('.env', 'PORT=3333')
  })

  group.each.teardown(async ({ context: { fs } }) => {
    await fs.remove('.env')
    sinon.restore()
  })

  test('up start all services', async ({ assert }) => {
    const upAllStub = sinon.stub().resolves({ exitCode: 0, out: '', err: '' })

    const DockerComposeRunner = await esmock('../src/docker_compose_runner.ts', {
      'docker-compose': {
        upAll: upAllStub,
      },
    })

    const runner = new DockerComposeRunner(app)

    const result = await runner.up(undefined, '.env', () => {})

    assert.equal(result.exitCode, 0)

    assert.isTrue(
      upAllStub.calledOnceWith(
        sinon.match
          .has('cwd', sinon.match.string)
          .and(sinon.match.has('composeOptions', sinon.match.array))
          .and(sinon.match.has('callback', sinon.match.func))
      )
    )
  })

  test('up start one service', async ({ assert }) => {
    const upOneStub = sinon.stub().resolves({ exitCode: 0, out: '', err: '' })

    const DockerComposeRunner = await esmock('../src/docker_compose_runner.ts', {
      'docker-compose': {
        upOne: upOneStub,
      },
    })

    const runner = new DockerComposeRunner(app)

    const result = await runner.up(['mysql'], '.env', () => {})

    assert.equal(result.exitCode, 0)

    assert.isTrue(
      upOneStub.calledOnceWith(
        sinon.match('mysql'),
        sinon.match
          .has('cwd', sinon.match.string)
          .and(sinon.match.has('composeOptions', sinon.match.array))
          .and(sinon.match.has('callback', sinon.match.func))
      )
    )
  })

  test('up start many service', async ({ assert }) => {
    const upManyStub = sinon.stub().resolves({ exitCode: 0, out: '', err: '' })

    const DockerComposeRunner = await esmock('../src/docker_compose_runner.ts', {
      'docker-compose': {
        upMany: upManyStub,
      },
    })

    const runner = new DockerComposeRunner(app)

    const result = await runner.up(['mysql', 'redis'], '.env', () => {})

    assert.equal(result.exitCode, 0)

    assert.isTrue(
      upManyStub.calledOnceWith(
        sinon.match(['mysql', 'redis']),
        sinon.match
          .has('cwd', sinon.match.string)
          .and(sinon.match.has('composeOptions', sinon.match.array))
          .and(sinon.match.has('callback', sinon.match.func))
      )
    )
  })

  test('down stop all services', async ({ assert }) => {
    const downAllStub = sinon.stub().resolves({ exitCode: 0, out: '', err: '' })

    const DockerComposeRunner = await esmock('../src/docker_compose_runner.ts', {
      'docker-compose': {
        downAll: downAllStub,
      },
    })

    const runner = new DockerComposeRunner(app)

    const result = await runner.down(undefined, () => {})

    assert.equal(result.exitCode, 0)

    assert.isTrue(
      downAllStub.calledOnceWith(
        sinon.match
          .has('cwd', sinon.match.string)
          .and(sinon.match.has('callback', sinon.match.func))
      )
    )
  })

  test('down stop one service', async ({ assert }) => {
    const downOneStub = sinon.stub().resolves({ exitCode: 0, out: '', err: '' })

    const DockerComposeRunner = await esmock('../src/docker_compose_runner.ts', {
      'docker-compose': {
        downOne: downOneStub,
      },
    })

    const runner = new DockerComposeRunner(app)

    const result = await runner.down(['mysql'], () => {})

    assert.equal(result.exitCode, 0)

    assert.isTrue(
      downOneStub.calledOnceWith(
        sinon.match('mysql'),
        sinon.match
          .has('cwd', sinon.match.string)
          .and(sinon.match.has('callback', sinon.match.func))
      )
    )
  })

  test('down stop many service', async ({ assert }) => {
    const downManyStub = sinon.stub().resolves({ exitCode: 0, out: '', err: '' })

    const DockerComposeRunner = await esmock('../src/docker_compose_runner.ts', {
      'docker-compose': {
        downMany: downManyStub,
      },
    })

    const runner = new DockerComposeRunner(app)

    const result = await runner.down(['mysql', 'redis'], () => {})

    assert.equal(result.exitCode, 0)

    assert.isTrue(
      downManyStub.calledOnceWith(
        sinon.match(['mysql', 'redis']),
        sinon.match
          .has('cwd', sinon.match.string)
          .and(sinon.match.has('callback', sinon.match.func))
      )
    )
  })

  test('ps collect status of running services', async ({ assert }) => {
    const psStub = sinon.stub().resolves({
      exitCode: 0,
      data: {
        services: [
          {
            name: 'mysql',
            state: 'running',
            ports: [{ mapped: { port: '3306' }, exposed: { port: '3306' } }],
          },
        ],
      },
    })

    const DockerComposeRunner = await esmock('../src/docker_compose_runner.ts', {
      'docker-compose': {
        ps: psStub,
      },
    })

    const runner = new DockerComposeRunner(app)

    const result = await runner.ps()

    assert.equal(result.exitCode, 0)
    assert.lengthOf(result.services, 1)
    assert.deepEqual(result.services[0], { name: 'mysql', state: 'running', ports: '3306:3306' })

    assert.isTrue(
      psStub.calledOnceWith(
        sinon.match
          .has('cwd', sinon.match.string)
          .and(sinon.match.has('commandOptions', sinon.match([['--format', 'json']])))
      )
    )
  })
})
