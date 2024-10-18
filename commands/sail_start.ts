import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import DockerComposeRunner from '../src/docker_compose_runner.js'
import type { Service } from '../src/services.js'

export default class SailAdd extends BaseCommand {
  static commandName = 'sail:start'
  static description = 'Start services defined in compose.yml file'

  static settings = {
    loadApp: false,
    stayAlive: false,
  }

  @args.spread({ required: false, description: 'Services to start (empty for all)' })
  declare services: string[]

  @flags.string({
    default: '.env',
    description: 'Path to .env file for `docker compose up` command to use',
  })
  declare envFile: string

  async run() {
    const runner = new DockerComposeRunner(this.app)

    const selectedServices: Service[] | undefined = this.services as any

    const spinner = this.logger.await('Starting services').start()

    try {
      const result = await runner.up(selectedServices, this.envFile, (line) => spinner.update(line))
      spinner.update('Services started').stop()
      this.exitCode = result.exitCode || undefined
    } catch (error) {
      spinner.stop()
      this.logger.logError(error?.err?.trim() || 'Failed to start services')
      this.exitCode = error.exitCode
    }
  }
}
