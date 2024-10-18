import { BaseCommand, args } from '@adonisjs/core/ace'
import DockerComposeRunner from '../src/docker_compose_runner.js'
import type { Service } from '../src/services.js'

export default class SailAdd extends BaseCommand {
  static commandName = 'sail:stop'
  static description = 'Stop services defined in compose.yml file'

  static settings = {
    loadApp: false,
    stayAlive: false,
  }

  @args.spread({ required: false, description: 'Services to stop (empty for all)' })
  declare services: string[]

  async run() {
    const runner = new DockerComposeRunner(this.app)

    const selectedServices: Service[] | undefined = this.services as any

    const spinner = this.logger.await('Stoping services').start()

    try {
      const result = await runner.down(selectedServices, (line) => spinner.update(line))
      spinner.update('Services stoped').stop()
      this.exitCode = result.exitCode || undefined
    } catch (error) {
      spinner.stop()
      this.logger.logError(error?.err?.trim() || 'Failed to stop services')
      this.exitCode = error.exitCode
    }
  }
}
