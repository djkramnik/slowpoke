import OpenAI from 'openai'
import { ResponsesModel } from 'openai/resources/shared'

let _client: OpenAI

export const getOpenAiClient = () => {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']
    })
  }
  return _client
}

const getCompletionFactory = ({
  model,
  instructions,
}: {
  model: ResponsesModel
  instructions: string // later, if needed, can vary the instructions with templating
}) => {
  return function getCompletion(input: string) {
    return getOpenAiClient().responses.create({
      model,
      instructions,
      input,
    })
  }
}

export const completions = {
  getPos: getCompletionFactory.bind(null, {
    model: 'gpt-4o',
    instructions: `give me the parts of speech for this sentence:` // help with creating these unwieldy chunks of text?
  })
}