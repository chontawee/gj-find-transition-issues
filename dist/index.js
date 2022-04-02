/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 406:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const HttpClient = __nccwpck_require__(253)
const Jira = __nccwpck_require__(512)

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

/***/ }),

/***/ 253:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const axios = __nccwpck_require__(748)

class HttpClient {

  constructor() {
    this.token = Buffer.from(`${process.env.JIRA_USER_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')
    axios.defaults.baseURL = `${process.env.JIRA_BASE_URL}/rest/api/3`
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.token}`
    }
  }

  async get(path) {
    return axios({
      method: 'get',
      url: path,
      headers: this.headers
    }).then(result => result.data)
  }

  async post(path, body) {
    return axios({
      method: 'post',
      url: path,
      headers: this.headers,
      data: body
    }).then(result => result.data)
  }

}

module.exports = HttpClient

/***/ }),

/***/ 512:
/***/ ((module) => {

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

/***/ }),

/***/ 920:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 748:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(920)
const fs = __nccwpck_require__(147)
const App = __nccwpck_require__(406)

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

})();

module.exports = __webpack_exports__;
/******/ })()
;