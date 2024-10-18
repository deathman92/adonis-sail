import type { ApplicationService } from '@adonisjs/core/types'
import { downAll, downMany, downOne, ps, upAll, upMany, upOne } from 'docker-compose'
import type { IDockerComposeResult } from 'docker-compose'
import type { Service } from './services.js'

export type LogCallback = (line: string) => void

export default class DockerComposeRunner {
  constructor(private app: ApplicationService) {}

  async up(services: Service[] | undefined, envFile: string, logCallback: LogCallback) {
    const { rootPath, envFilePath } = this.#getPath(envFile)

    let result: IDockerComposeResult
    if (!services) {
      result = await upAll({
        cwd: rootPath,
        callback: this.#callback(logCallback),
        composeOptions: [`--env-file=${envFilePath}`],
      })
    } else if (services.length === 1) {
      result = await upOne(services[0], {
        cwd: rootPath,
        callback: this.#callback(logCallback),
        composeOptions: [`--env-file=${envFilePath}`],
      })
    } else {
      result = await upMany(services, {
        cwd: rootPath,
        callback: this.#callback(logCallback),
        composeOptions: [`--env-file=${envFilePath}`],
      })
    }
    return result
  }

  async down(services: Service[] | undefined, logCallback: LogCallback) {
    const { rootPath } = this.#getPath()

    let result: IDockerComposeResult
    if (!services) {
      result = await downAll({
        cwd: rootPath,
        callback: this.#callback(logCallback),
      })
    } else if (services.length === 1) {
      result = await downOne(services[0], {
        cwd: rootPath,
        callback: this.#callback(logCallback),
      })
    } else {
      result = await downMany(services, {
        cwd: rootPath,
        callback: this.#callback(logCallback),
      })
    }
    return result
  }

  async ps() {
    const { rootPath } = this.#getPath()

    const result = await ps({
      cwd: rootPath,
      commandOptions: [['--format', 'json']],
    })

    return {
      exitCode: result.exitCode,
      services: result.data.services.map((service) => ({
        name: service.name,
        state: service.state,
        ports: service.ports
          .map((port) => [port.mapped?.port, port.exposed?.port].join(':'))
          .join('\n'),
      })),
    }
  }

  #getPath(envFile?: string) {
    const rootPath = this.app.makePath('.')
    const envFilePath = envFile && this.app.makePath(envFile)
    return { rootPath, envFilePath }
  }

  #callback(logCallback: LogCallback) {
    return (chunk: Buffer, _streamSource?: 'stdout' | 'stderr') => {
      String(chunk)
        .trim()
        .split('\n')
        .forEach((line) => {
          line = line.trim()
          if (!line || line.startsWith('no such') || line.startsWith('error')) {
            return
          }
          logCallback(line)
        })
    }
  }
}
