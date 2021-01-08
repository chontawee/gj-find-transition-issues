const App = require('./src/app')

try {
  const app = new App()
  app.init([], [], [])
} catch (error) {
  console.error(error)
  process.exit(1)
}
