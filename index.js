const core = require('@actions/core')
const fs = require('fs')
const App = require('./src/app')

const event = JSON.parse(
  fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
)

try {
  const input = {
    issuetypes: core.getInput('issuetypes'),
    transitions: core.getInput('transitions')
  }
  if (!input.issuetypes || !input.transitions) {
    throw new Error('Invalid input')
  }
  const issuetypes = input.issuetypes.split(',')
  const transitions = input.transitions.split(',')
  if (issuetypes.length !== transitions.length) {
    throw new Error('Length of issuetypes input don\'t equal with length of transitions input')
  }
  const app = new App(event, issuetypes, transitions)
  app.init()
} catch (error) {
  core.setFailed(error.toString())
}
