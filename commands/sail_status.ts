import { BaseCommand } from '@adonisjs/core/ace'
import DockerComposeRunner from '../src/docker_compose_runner.js'

export default class SailAdd extends BaseCommand {
  static commandName = 'sail:status'
  static description = 'Get status of running services'

  static settings = {
    loadApp: false,
    stayAlive: false,
  }

  async run() {
    const runner = new DockerComposeRunner(this.app)

    try {
      const result = await runner.ps()

      if (result.services.length) {
        const table = this.ui.table()
        table.head(['Name', 'State', 'Ports'])

        for (let service of result.services) {
          table.row([service.name, service.state, service.ports])
        }

        table.render()
      } else {
        this.logger.log(this.colors.yellow('Services not started'))
      }

      this.exitCode = result.exitCode || undefined
    } catch (error) {
      this.logger.logError(error?.err?.trim() || 'Failed to start services')
      this.exitCode = error.exitCode
    }
  }
}
