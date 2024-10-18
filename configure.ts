/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import SailAdd from './commands/sail_add.js'

export async function configure(command: ConfigureCommand) {
  const codemods = await command.createCodemods()

  await codemods.updateRcFile((rcFile) => {
    rcFile.addCommand('@deathman92/adonis-sail/commands')
  })

  const ace = await command.app.container.make('ace')

  const selectedServices = command.parsedFlags.services ?? []

  const services = typeof selectedServices === 'string' ? [selectedServices] : selectedServices

  const addCommand = await ace.create(SailAdd, services)

  await addCommand.exec()

  command.exitCode = addCommand.exitCode
  command.result = addCommand.result
  command.error = addCommand.error
}
