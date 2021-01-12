const core = require("@actions/core");
const App = require("./src/app");

try {
  const input = {
    issueTypes: core.getInput("issue-types"),
    transitions: core.getInput("transitions"),
  };

  if (!input.issueTypes || !input.transitions) {
    throw new Error("Missing issue types or transitions");
  }

  const issueTypes = input.issueTypes.split(/,\s*/);
  const transitions = input.transitions.split(/,\s*/);

  if (issueTypes.length !== transitions.length) {
    throw new Error("Length of issue-types does not match transitions");
  }

  const app = new App(issueTypes, transitions);
  app.init();
} catch (error) {
  core.setFailed(error.toString());
}
