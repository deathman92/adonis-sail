import { args, BaseCommand } from '@adonisjs/core/ace'
import string from '@adonisjs/core/helpers/string'
import { SERVICES, type Service } from '../src/services.js'
import Generator from '../src/generator.js'

export default class SailAdd extends BaseCommand {
  static commandName = 'sail:add'
  static description = 'Add services to an existing Sail installation'

  static settings = {
    loadApp: false,
    stayAlive: false,
  }

  @args.spread({ required: false, description: 'Services to add' })
  declare services: string[]

  async run() {
    const generator = new Generator(this.app)

    let selectedServices: Service | Service[] | undefined = this.services as any

    if (!selectedServices) {
      selectedServices = await this.prompt.multiple(
        'Select services you want to run along your Adonis Application',
        SERVICES,
        {
          validate(values) {
            return !values || !values.length ? 'Please select one or more services' : true
          },
        }
      )
    }
    const services = typeof selectedServices === 'string' ? [selectedServices] : selectedServices!

    const unknownServices = services.find((service) => !SERVICES.includes(service))
    if (unknownServices) {
      this.exitCode = 1
      this.logger.logError(
        `Invalid service "${unknownServices}". Supported services are: ${string.sentence(SERVICES)}`
      )
      return
    }

    const { installedServices, notInstalledServices } =
      await generator.checkServicesInstalled(services)

    if (installedServices.length) {
      this.logger.warning(
        `Services ${installedServices.join(', ')} already installed. They will be skipped`
      )
    }

    let servicesToInstall: Service[] = notInstalledServices
    let servicesToRemove: Service[] = []
    const databases = await generator.checkDatabases(services)
    if (databases.length > 1) {
      const selectedDatabase = await this.prompt.choice(
        `Multiple database services selected or installed. Please, select only one database service.`,
        databases,
        {
          validate(value) {
            return value ? true : 'Please select database'
          },
        }
      )
      servicesToInstall = [
        selectedDatabase,
        ...servicesToInstall.filter((service) => !databases.includes(service)),
      ]
      servicesToRemove = databases.filter((service) => service !== selectedDatabase)
    }

    const action = this.logger.action('generate compose.yml file')

    if (!servicesToInstall.length) {
      action.skipped('no services to install')
      return
    }

    await generator.buildDockerCompose(servicesToInstall, servicesToRemove)

    action.succeeded()

    const codemods = await this.createCodemods()

    await generator.replaceEnvVariables(servicesToInstall, codemods)

    this.logger.log(
      this.colors.green(
        `You can now start services with ${this.colors.yellow().underline('node ace sail:start')} command`
      )
    )
  }
}
