const HttpClient = require('./httpClient')
const Jira = require('./jira')

class App {

  constructor() {
    this.httpClient = new HttpClient()
    this.jira = new Jira(this.httpClient)
  }

  async init(issues, issuetypes, transitions) {
    this.validateInput()

    const transitionIds = await this.getTransitionId(issues, issuetypes, transitions)
    await this.transitionIssues(issues, transitionIds)
  }

  validateInput() {
    if (!process.env.JIRA_BASE_URL) throw new Error('Please specify JIRA_BASE_URL env')
    if (!process.env.JIRA_API_TOKEN) throw new Error('Please specify JIRA_API_TOKEN env')
    if (!process.env.JIRA_USER_EMAIL) throw new Error('Please specify JIRA_USER_EMAIL env')
  }

  async getTransitionId(issues, issuetypes, transitions) {
    const transitionIds = [];
    for (const issue of issues) {
      const issueData = await this.jira.getIssue(issue)
      const issuetypeName = issueData.fields.issuetype.name
      const issuetypeIndex = issuetypes.indexOf(issuetypeName)
      const { transitions: availableTransitions } = await this.jira.getIssueTransitions(issue)
      const designedTransition = availableTransitions.find(eachTransition => eachTransition.name === transitions[issuetypeIndex])
      if (!designedTransition) {
        throw new Error(`Cannot find transition "${transition}"`)
      }
      transitionIds.push({
        id: designedTransition.id,
        name: designedTransition.name
      })
    }
    return transitionIds
  }

  async transitionIssues(issues, transitionIds) {
    for (let i=0; i<issues.length; i++) {
      console.log(`Transitioning issue "${issues[i]}" to "${transitionIds[i].name}"`)
      await this.jira.transitionIssue(issues[i], transitionIds[i].id)
    }
  }

}

module.exports = App