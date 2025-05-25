#!/usr/bin/env ts-node

// slowpoke resurrected. again.

import dotenv from 'dotenv'
import { getCli } from './util/cli'
import { completions } from './completion/openai'

// need my keys
dotenv.config()

// main
!(async () => {
  const { start } = getCli()

  await start({
    handleInput,
    prompt: 'Enter one or more sentences to parse:',
    inputPrefix: '>'
  })

  console.log('goodbye!')
  process.exit(0)
})()

async function handleInput(s: string) {
  try {
    const response = await completions.getPos(s)
    console.log(response)
  } catch(e) {
    console.error(e)
  }
}
