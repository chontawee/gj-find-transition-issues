const HttpClient = require('./httpClient')
const Jira = require('./jira')

class App {

  constructor(event, issuetypes, transitions) {
    this.event = event
    this.issuetypes = issuetypes
    this.transitions = transitions
    this.httpClient = new HttpClient()
    this.jira = new Jira(this.httpClient)
  }

  async init() {
    this.validateInput()

    const commitMessages = this.getCommitMessages()
    const issueKeys = this.findIssueKeys(commitMessages)
    const transitionIssues = await this.getTransitionIdsAndKeys(issueKeys)
    await this.transitionIssues(transitionIssues.issueKeys, transitionIssues.transitionIds)
  }

  validateInput() {
    if (!process.env.JIRA_BASE_URL) throw new Error('Please specify JIRA_BASE_URL env')
    if (!process.env.JIRA_API_TOKEN) throw new Error('Please specify JIRA_API_TOKEN env')
    if (!process.env.JIRA_USER_EMAIL) throw new Error('Please specify JIRA_USER_EMAIL env')
  }

  getCommitMessages() {
    const commitMessages = this.event.commits.map(commit => commit.message).join(' ')
    console.log(`Commit messages: ${commitMessages}`)
    return commitMessages
  }

  findIssueKeys(commitMessages) {
    const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g
    // Get issue keys and remove duplicate keys
    const issueKeys = commitMessages.match(issueIdRegEx).filter((elem, index, self) => index === self.indexOf(elem))
    if (!issueKeys) {
      throw new Error(`Commit messages doesn't contain any issue keys`)
    }
    console.log(`Found issue keys: ${issueKeys.join(' ')}`)
    return issueKeys
  }

  async getTransitionIdsAndKeys(issues) {
    const transitionIds = [];
    const issueKeys = [];
    for (const issue of issues) {
      const issueData = await this.jira.getIssue(issue)
      const issuetypeName = issueData.fields.issuetype.name
      const issueStatus = issueData.fields.status.name
      const issuetypeIndex = this.issuetypes.indexOf(issuetypeName)
      
      if (this.transitions[issuetypeIndex] !== issueStatus) { // current status !== transition status
        const { transitions: availableTransitions } = await this.jira.getIssueTransitions(issue)
        const designedTransition = availableTransitions.find(eachTransition => eachTransition.name === this.transitions[issuetypeIndex])
        if (!designedTransition) {
          console.log(`Cannot find transition "${this.transitions[issuetypeIndex]} for issue ${issue.name}"`)
          console.log('Possible transitions:')
          availableTransitions.forEach((t) => {
            console.log(`{ id: ${t.id}, name: ${t.name} } transitions issue to '${t.to.name}' status.`)
          })
        }
        else{
          issueKeys.push(issue)
          transitionIds.push({
            id: designedTransition.id,
            name: designedTransition.name
          })
        }
      } else { // current status === transition status
        console.log(`Issue ${issue} is already in ${issueStatus} status`)
      }
    }
    return { issueKeys, transitionIds }
  }

  async transitionIssues(issueKeys, transitionIds) {
    for (let i=0; i<issueKeys.length; i++) {
      console.log(`Transitioning issue "${issueKeys[i]}" to "${transitionIds[i].name}"`)
      await this.jira.transitionIssue(issueKeys[i], transitionIds[i].id)
    }
  }

}

module.exports = App