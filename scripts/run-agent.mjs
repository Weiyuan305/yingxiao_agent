import { collectAll } from './collect.mjs'
import { buildIntelligence } from './agent.mjs'
import { loadLocalEnv } from './env.mjs'

async function run() {
  await loadLocalEnv()
  const collected = await collectAll()
  const intelligence = await buildIntelligence()
  console.log(`Refresh complete: ${intelligence.meta.itemCount} cards from ${collected.meta.successfulSourceCount}/${collected.meta.sourceCount} sources.`)
  if (collected.meta.skippedSourceCount > 0) {
    console.log(`${collected.meta.skippedSourceCount} source(s) skipped. Configure required API tokens to enable them.`)
  }
  if (collected.meta.failedSourceCount > 0) {
    console.log(`${collected.meta.failedSourceCount} source(s) failed. See data/collected.json for errors.`)
  }
}

run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
