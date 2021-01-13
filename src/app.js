const core = require("@actions/core");
const Jira = require("./jira");
const Github = require("./github");

class App {
  constructor() {
    const issueTypes = core.getInput("issue-types");
    const transitions = core.getInput("transitions");

    if (!issueTypes || !transitions) {
      throw new Error("Missing issue types or transitions");
    }

    if (issueTypes.length !== transitions.length) {
      throw new Error("Length of issue-types does not match transitions");
    }

    this.issueTypes = issueTypes.split(/,\s*/);
    this.transitions = transitions.split(/,\s*/);
    this.jira = new Jira();
    this.github = new Github();
  }

  async run() {
    const commitMessages = await this.github.getPullRequestCommitMessages();
    console.log(`Commit messages: ${commitMessages.join(" ")}`);

    const issueKeys = this.findIssueKeys(commitMessages);
    if (!issueKeys) {
      console.log(`Commit messages doesn't contain any issue keys`);
      return;
    }

    console.log(`Found issue keys: ${issueKeys.join(" ")}`);
    const transitionIssues = await this.getTransitionIdsAndKeys(issueKeys);
    await this.transitionIssues(
      transitionIssues.issueKeys,
      transitionIssues.transitionIds
    );
  }

  findIssueKeys(commitMessages) {
    const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g;
    const matches = commitMessages.join(" ").match(issueIdRegEx);
    if (!matches) return [];
    return [...new Set(matches)];
  }

  async getTransitionIdsAndKeys(issues) {
    const transitionIds = [];
    const issueKeys = [];

    for (const issue of issues) {
      const issueData = await this.jira.getIssue(issue);
      const issueTypeName = issueData.fields.issuetype.name;
      const issueStatus = issueData.fields.status.name;
      const issueTypeIndex = this.issueTypes.indexOf(issueTypeName);
      const targetStatus = this.transitions[issueTypeIndex];

      if (targetStatus === issueStatus) {
        console.log(`Issue ${issue} is already in ${issueStatus} status`);
        continue;
      }

      issueKeys.push(issue);
      const { transitions } = await this.jira.getIssueTransitions(issue);
      const targetTransition = transitions.find((x) => x.name === targetStatus);

      if (!targetTransition) {
        throw new Error(`Cannot find transition "${targetStatus}"`);
      }

      transitionIds.push({
        id: targetTransition.id,
        name: targetTransition.name,
      });
    }

    return { issueKeys, transitionIds };
  }

  async transitionIssues(issues, transitionIds) {
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const transition = transitionIds[i];
      console.log(`Transition issue "${issue}" to "${transition.name}"`);
      await this.jira.transitionIssue(issue, transition.id);
    }
  }
}

module.exports = App;
