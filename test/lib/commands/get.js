const t = require('tap')
const { real: mockNpm } = require('../../fixtures/mock-npm')

t.test('should retrieve values from config', async t => {
  const { joinedOutput, npm } = mockNpm(t)
  const name = 'editor'
  const value = 'vigor'
  await npm.load()
  npm.config.set(name, value)
  await npm.exec('get', [name])
  t.equal(
    joinedOutput(),
    value,
    'outputs config item'
  )
})
