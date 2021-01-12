const HttpClient = require('./httpClient')
const Jira = require('./jira')

class App {

  constructor(githubEvent, issuetypes, transitions) {
    this.githubEvent = githubEvent
    this.issuetypes = issuetypes
    this.transitions = transitions
    this.httpClient = new HttpClient()
    this.jira = new Jira(this.httpClient)
  }

  async init() {
    this.validateInput()

    const commitMessages = this.getCommitMessages()
    const issueKeys = this.findIssueKeys(commitMessages)
    const transitionIds = await this.getTransitionId(issueKeys)
    await this.transitionIssues(issueKeys, transitionIds)
  }

  validateInput() {
    if (!process.env.JIRA_BASE_URL) throw new Error('Please specify JIRA_BASE_URL env')
    if (!process.env.JIRA_API_TOKEN) throw new Error('Please specify JIRA_API_TOKEN env')
    if (!process.env.JIRA_USER_EMAIL) throw new Error('Please specify JIRA_USER_EMAIL env')
  }

  getCommitMessages() {
    const commitMessages = this.githubEvent.event.commits.map(commit => commit.message).join(' ')
    console.log(`Commit messages: ${commitMessages}`)
    return commitMessages
  }

  findIssueKeys(commitMessages) {
    const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g
    const issueKeys = commitMessages.match(issueIdRegEx)
    if (!issueKeys) {
      throw new Error(`Commit messages doesn't contain any issue keys`)
    }
    console.log(`Found issue keys: ${issueKeys.join(' ')}`)
    return issueKeys
  }

  async getTransitionId(issues) {
    const transitionIds = [];
    for (const issue of issues) {
      const issueData = await this.jira.getIssue(issue)
      const issuetypeName = issueData.fields.issuetype.name
      const issuetypeIndex = this.issuetypes.indexOf(issuetypeName)
      const { transitions: availableTransitions } = await this.jira.getIssueTransitions(issue)
      const designedTransition = availableTransitions.find(eachTransition => eachTransition.name === this.transitions[issuetypeIndex])
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