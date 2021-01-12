# action-transition-multiple-jira-issues

Find Jira issue keys from commit messages in pull requests and transition them

## Usage

```yaml
- name: Jira find and transition issues
  uses: bloobirds-it/action-transition-multiple-jira-issues
  with:
    jira-base-url: https://<yourdomain>.atlassian.net
    jira-user-email: human@example.com
    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
    issue-types: Story, Bug
    transitions: In Progress, In Progress
```

## Inputs

| **Name**        | **Description**                                                 | **Required** |
| --------------- | --------------------------------------------------------------- | ------------ |
| jira-base-url   | URL of Jira instance                                            | ✔            |
| jira-api-token  | Access Token for Authorization                                  | ✔            |
| jira-user-email | Email of the user for which Access Token was created for        | ✔            |
| issue-types     | Type of issues on your workflow. It will map with `transitions` | ✔            |
| transitions     | Transitions status to move each issue type                      | ✔            |

## References

- [chontawee/gj-find-transition-issues](https://github.com/chontawee/gj-find-transition-issues)
- [atlassian/gajira-login](https://github.com/atlassian/gajira-login.git)
- [atlassian/gajira-find-issue-key](https://github.com/atlassian/gajira-find-issue-key.git)
- [atlassian/gajira-transition](https://github.com/atlassian/gajira-transition.git)
