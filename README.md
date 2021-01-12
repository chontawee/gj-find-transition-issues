# Github Jira find and transition issues
Find issue keys from commit messages and transition them to status which you want
## Usage
```yaml
- name: Jira find and transition issues
  uses: chontawee/gj-find-transition-issues@1.0.4
  env:
    JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
    JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
    JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
  with:
    issuetypes: Story,Bug
    transitions: In Progress,In Progress
```
## Variables
<b> Environment Variables </b>
- JIRA_BASE_URL - URL of Jira instance. Example: https://<yourdomain>.atlassian.net
- JIRA_API_TOKEN - Access Token for Authorization. Example: HXe8DGg1iJd2AopzyxkFB7F2
- JIRA_USER_EMAIL - email of the user for which Access Token was created for. Example: human@example.com
<b> Arguments </b>
- issuetypes - Type of issues on your workflow. They will map with `transitions` arguments. Example: Story,Bug
- transitions - Transitions status which you want to move. They will depends on `issuetypes` argument. Example: In Progress,To Do
Note: Relationship between `issuetypes` and `transitions` argument be shown below
Example `issuetypes` is `Story,Bug` and `transtions` is `In Progress, To Do`

| Issue Types | Transitions To |
| ------------|---------------|
| Story | In Progress |
| Bug | To Do |

## References
- [atlassian/gajira-login](https://github.com/atlassian/gajira-login.git)
- [atlassian/gajira-find-issue-key](https://github.com/atlassian/gajira-find-issue-key.git)
- [atlassian/gajira-transition](https://github.com/atlassian/gajira-transition.git)
