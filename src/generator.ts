import { access, constants, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Codemods } from '@adonisjs/core/ace/codemods'
import type { ApplicationService } from '@adonisjs/core/types'
import YAML from 'yaml'
import { DATABASES, ENV_VARIABLES, type Service } from './services.js'
import { stubsRoot } from '../stubs/main.js'

export default class Generator {
  constructor(private app: ApplicationService) {}

  async buildDockerCompose(servicesToInstall: Service[], servicesToRemove: Service[]) {
    const { compose, composePath } = await this.#readComposeFile()

    compose.services = compose.services || {}
    compose.volumes = compose.volumes || {}

    for (let service of servicesToRemove) {
      if (Object.keys(compose.services).includes(service)) {
        delete compose.services[service]
      }
      if (Object.keys(compose.volumes).includes(`sail-${service}`)) {
        delete compose.volumes[`sail-${service}`]
      }
    }

    for (let service of servicesToInstall) {
      if (Object.keys(compose.services).includes(service)) {
        continue
      }

      compose.services = {
        ...compose.services,
        ...YAML.parse(await readFile(join(stubsRoot, 'services', `${service}.stub`), 'utf-8')),
      }

      if (
        !['mysql', 'pgsql', 'mariadb', 'redis', 'meilisearch', 'typesense', 'minio'].includes(
          service
        )
      ) {
        continue
      }

      if (Object.keys(compose.volumes).includes(`sail-${service}`)) {
        continue
      }

      compose.volumes[`sail-${service}`] = { driver: 'local' }
    }

    if (!Object.keys(compose.volumes).length) {
      delete compose.volumes
    }

    const yaml = YAML.stringify(compose, {
      doubleQuotedAsJSON: true,
      lineWidth: 180,
      defaultKeyType: 'PLAIN',
      defaultStringType: 'QUOTE_SINGLE',
    })

    await writeFile(composePath, yaml)
  }

  async replaceEnvVariables(services: Service[], codemods: Codemods) {
    const envVars = Object.keys(ENV_VARIABLES)
      .filter((service) => services.includes(service as Service))
      .reduce<Record<string, any>>(
        (vars, service) => ({ ...vars, ...ENV_VARIABLES[service as Service] }),
        {}
      )

    await codemods.defineEnvVariables(envVars)
  }

  async checkServicesInstalled(services: Service[]) {
    const { compose } = await this.#readComposeFile()

    return {
      installedServices: services.filter((service) =>
        Object.keys(compose.services || {}).includes(service)
      ),
      notInstalledServices: services.filter(
        (service) => !Object.keys(compose.services || {}).includes(service)
      ),
    }
  }

  async checkDatabases(services: Service[]) {
    const { compose } = await this.#readComposeFile()
    const allServices = new Set([
      ...services,
      ...(Object.keys(compose.services || {}) as Service[]),
    ])

    const databases = new Set([...allServices].filter((service) => DATABASES.has(service)))

    return [...databases]
  }

  async #readComposeFile() {
    const composePath = this.app.makePath('compose.yml')
    const compose = (await this.#exists(composePath))
      ? YAML.parse(await readFile(composePath, 'utf-8'))
      : YAML.parse(await readFile(join(stubsRoot, 'services', 'compose.stub'), 'utf-8'))

    return { compose, composePath }
  }

  async #exists(path: string) {
    try {
      await access(path, constants.R_OK | constants.W_OK)
      return true
    } catch {
      return false
    }
  }
}
