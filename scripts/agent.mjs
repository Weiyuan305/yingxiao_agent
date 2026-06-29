import { pathToFileURL } from 'node:url'
import {
  StudyAbroadMarketingAgent,
  buildIntelligence
} from '../dist/agent/pipeline.mjs'
import { generateOne, streamOne } from '../dist/agent/llm.mjs'
import { factCheck } from '../dist/agent/factcheck.mjs'

export { StudyAbroadMarketingAgent, buildIntelligence, generateOne, streamOne, factCheck }

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  buildIntelligence()
    .then(payload => {
      console.log(`Generated ${payload.meta.itemCount} intelligence cards using ${payload.meta.llm.mode}.`)
      console.log(`Agent steps: ${payload.meta.agent.steps.map(step => `${step.id}:${step.status}`).join(' -> ')}`)
      if (payload.meta.llm.errorCount) {
        console.log(`${payload.meta.llm.errorCount} LLM calls failed and used rules fallback.`)
      }
    })
    .catch(error => {
      console.error(error)
      process.exitCode = 1
    })
}
