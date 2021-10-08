const t = require('tap')
const { real: mockNpm } = require('../../fixtures/mock-npm')

t.test('prefix', async t => {
  const { joinedOutput, npm } = mockNpm(t)
  await npm.exec('prefix', [])
  t.equal(
    joinedOutput(),
    npm.prefix,
    'outputs npm.prefix'
  )
})
