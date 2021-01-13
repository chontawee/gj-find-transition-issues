const github = require("@actions/github");
const core = require("@actions/core");

class Github {
  constructor() {
    const token = core.getInput("github-token");

    if (!token) {
      throw new Error("Missing GitHub token input");
    }

    this.octokit = github.getOctokit(token);
  }

  async getPullRequestCommitMessages() {
    const { data, status } = await this.octokit.pulls.listCommits({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      pull_number: github.context.issue.number,
    });

    if (status !== 200) {
      throw new Error("Something went wrong fetching commits from PR");
    }

    return data.map((x) => x.commit.message);
  }
}

module.exports = Github;
