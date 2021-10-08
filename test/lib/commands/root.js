const t = require('tap')
const { real: mockNpm } = require('../../fixtures/mock-npm')

t.test('prefix', async (t) => {
  const { joinedOutput, npm } = mockNpm(t)
  await npm.exec('root', [])
  t.equal(
    joinedOutput(),
    npm.dir,
    'outputs npm.dir'
  )
})
