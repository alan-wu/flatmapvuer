/**
 * Vuese Dev Docs Watcher
 *
 * To watch components changes for Vuese gen
 * so that Vitepress dev will refresh the docs for components
 */

import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'
import { parser } from '@vuese/parser'
import { Render } from '@vuese/markdown-render'

const componentsDir = 'src/components'
const components = ['FlatmapVuer.vue', 'MultiFlatmapVuer.vue']
const outputDir = 'docs/components'

const watcher = chokidar.watch(components, {
  cwd: componentsDir,
  ignoreInitial: true,
})

function generateMarkdown(file) {
  const fileWithPath = `${componentsDir}/${file}`
  const fileContent = fs.readFileSync(fileWithPath, 'utf-8')

  try {
    const parserResult = parser(fileContent)
    const r = new Render(parserResult)
    const renderResult = r.render()
    const markdownResult = r.renderMarkdown()
    const markdownContent = markdownResult.content
    const componentName = path.basename(fileWithPath, '.vue')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    fs.writeFile(`${outputDir}/${componentName}.md`, markdownContent, (err) => {
      if (err) {
        console.error(`Error writing markdown file for ${componentName}`, err)
      } else {
        console.log(`Markdown file for ${componentName} is generated!`)
      }
    })
  } catch(e) {
    console.error(e)
  }
}

// Run on first load
components.forEach((component) => {
  console.log(`Write markdown file for ${component} on first load.`)
  generateMarkdown(component)
})

// Run on file change
watcher.on('change', (file) => {
  console.log(`The component ${file} has changed!`)
  generateMarkdown(file)
})
