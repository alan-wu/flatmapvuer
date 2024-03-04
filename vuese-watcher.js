/**
 * Vuese Dev Docs Watcher
 *
 * To watch components changes for Vuese gen
 * so that Vitepress dev will refresh the docs for components
 */

import chokidar from 'chokidar'
import { exec } from 'child_process'

const componentsDir = 'src/components'
const components = ['FlatmapVuer.vue', 'MultiFlatmapVuer.vue']


const watcher = chokidar.watch(components, {
  cwd: componentsDir,
  ignoreInitial: true,
})

watcher.on('change', (path) => {
  console.log(`The component ${path} has changed!`)

  exec('npm run vuese-gen', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing vuese command: ${error}`)
      return
    }
    console.log(`Vuese generated ${stdout}`)
  })
})
