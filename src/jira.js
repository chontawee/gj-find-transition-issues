class Jira {

  constructor(httpClient) {
    this.httpClient = httpClient
  }

  async getIssue(issueId) {
    const path = `issue/${issueId}`
    return this.httpClient.get(path)
  }

  async getIssueTransitions(issueId) {
    const path = `issue/${issueId}/transitions`
    return this.httpClient.get(path)
  }

  async transitionIssue(issueId, transitionId) {
    const path = `issue/${issueId}/transitions`
    const body = {
      transition: {
        id: transitionId
      }
    }
    return this.httpClient.post(path, body)
  }

}

module.exports = Jira