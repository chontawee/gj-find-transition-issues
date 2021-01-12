const core = require('@actions/core')
const githubEvent = require(process.env.GITHUB_EVENT_PATH)
const App = require('./src/app')

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
  const app = new App(githubEvent)
  app.init(issuetypes, transitions)
} catch (error) {
  console.error(error)
  process.exit(1)
}
