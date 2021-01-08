const axios = require('axios')

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