const { test } = require('tap')
const requireInject = require('require-inject')

const emptyMock = requireInject('../../lib/access.js', {
  '../../lib/npm.js': {
    flatOptions: {}
  }
})

test('unrecognized subcommand', (t) => {
  const access = emptyMock

  access(['blerg'], (err) => {
    t.match(
      err,
      /Usage: blerg is not a recognized subcommand/,
      'should throw EUSAGE on missing subcommand'
    )
    t.end()
  })
})

test('edit', (t) => {
  const access = emptyMock

  access([
    'edit',
    '@scoped/another'
  ], (err) => {
    t.match(
      err,
      /edit subcommand is not implemented yet/,
      'should throw not implemented yet error'
    )
    t.end()
  })
})

test('access public on unscoped package', (t) => {
  const prefix = t.testdir({
    'package.json': JSON.stringify({
      name: 'npm-access-public-pkg'
    })
  })
  const access = requireInject('../../lib/access.js', {
    '../../lib/npm.js': { prefix }
  })
  access([
    'public'
  ], (err) => {
    t.match(
      err,
      /Usage: This command is only available for scoped packages/,
      'should throw scoped-restricted error'
    )
    t.end()
  })
})

test('access public on scoped package', (t) => {
  t.plan(4)
  const name = '@scoped/npm-access-public-pkg'
  const prefix = t.testdir({
    'package.json': JSON.stringify({ name })
  })
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      public: (pkg, { registry }) => {
        t.equal(pkg, name, 'should use pkg name ref')
        t.equal(
          registry,
          'https://registry.npmjs.org',
          'should forward correct options'
        )
        return true
      }
    },
    '../../lib/npm.js': {
      flatOptions: {
        registry: 'https://registry.npmjs.org'
      },
      prefix
    }
  })
  access([
    'public'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access public on scoped package')
  })
})

test('access public on missing package.json', (t) => {
  const prefix = t.testdir({
    'node_modules': {}
  })
  const access = requireInject('../../lib/access.js', {
    '../../lib/npm.js': { prefix }
  })
  access([
    'public'
  ], (err) => {
    t.match(
      err,
      /no package name passed to command and no package.json found/,
      'should throw no package.json found error'
    )
    t.end()
  })
})

test('access public on invalid package.json', (t) => {
  const prefix = t.testdir({
    'package.json': '{\n',
    'node_modules': {}
  })
  const access = requireInject('../../lib/access.js', {
    '../../lib/npm.js': { prefix }
  })
  access([
    'public'
  ], (err) => {
    t.match(
      err,
      /JSONParseError/,
      'should throw failed to parse package.json'
    )
    t.end()
  })
})

test('access restricted on unscoped package', (t) => {
  const prefix = t.testdir({
    'package.json': JSON.stringify({
      name: 'npm-access-restricted-pkg'
    })
  })
  const access = requireInject('../../lib/access.js', {
    '../../lib/npm.js': { prefix }
  })
  access([
    'restricted'
  ], (err) => {
    t.match(
      err,
      /Usage: This command is only available for scoped packages/,
      'should throw scoped-restricted error'
    )
    t.end()
  })
})

test('access restricted on scoped package', (t) => {
  t.plan(4)
  const name = '@scoped/npm-access-restricted-pkg'
  const prefix = t.testdir({
    'package.json': JSON.stringify({ name })
  })
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      restricted: (pkg, { registry }) => {
        t.equal(pkg, name, 'should use pkg name ref')
        t.equal(
          registry,
          'https://registry.npmjs.org',
          'should forward correct options'
        )
        return true
      }
    },
    '../../lib/npm.js': {
      flatOptions: {
        registry: 'https://registry.npmjs.org'
      },
      prefix
    }
  })
  access([
    'restricted'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access restricted on scoped package')
  })
})

test('access restricted on missing package.json', (t) => {
  const prefix = t.testdir({
    'node_modules': {}
  })
  const access = requireInject('../../lib/access.js', {
    '../../lib/npm.js': { prefix }
  })
  access([
    'restricted'
  ], (err) => {
    t.match(
      err,
      /no package name passed to command and no package.json found/,
      'should throw no package.json found error'
    )
    t.end()
  })
})

test('access restricted on invalid package.json', (t) => {
  const prefix = t.testdir({
    'package.json': '{\n',
    'node_modules': {}
  })
  const access = requireInject('../../lib/access.js', {
    '../../lib/npm.js': { prefix }
  })
  access([
    'restricted'
  ], (err) => {
    t.match(
      err,
      /JSONParseError/,
      'should throw failed to parse package.json'
    )
    t.end()
  })
})

test('access grant read-only', (t) => {
  t.plan(5)
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      grant: (spec, team, permissions) => {
        t.equal(spec, '@scoped/another', 'should use expected spec')
        t.equal(team, 'myorg:myteam', 'should use expected team')
        t.equal(permissions, 'read-only', 'should forward permissions')
        return true
      }
    },
    '../../lib/npm.js': {}
  })
  access([
    'grant',
    'read-only',
    'myorg:myteam',
    '@scoped/another'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access grant read-only')
  })
})

test('access grant read-write', (t) => {
  t.plan(5)
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      grant: (spec, team, permissions) => {
        t.equal(spec, '@scoped/another', 'should use expected spec')
        t.equal(team, 'myorg:myteam', 'should use expected team')
        t.equal(permissions, 'read-write', 'should forward permissions')
        return true
      }
    },
    '../../lib/npm.js': {}
  })
  access([
    'grant',
    'read-write',
    'myorg:myteam',
    '@scoped/another'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access grant read-write')
  })
})

test('access grant current cwd', (t) => {
  t.plan(5)
  const prefix = t.testdir({
    'package.json': JSON.stringify({
      name: 'yargs'
    })
  })
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      grant: (spec, team, permissions) => {
        t.equal(spec, 'yargs', 'should use expected spec')
        t.equal(team, 'myorg:myteam', 'should use expected team')
        t.equal(permissions, 'read-write', 'should forward permissions')
        return true
      }
    },
    '../../lib/npm.js': { prefix }
  })
  access([
    'grant',
    'read-write',
    'myorg:myteam'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access grant current cwd')
  })
})

test('access grant others', (t) => {
  const access = emptyMock

  access([
    'grant',
    'rerere',
    'myorg:myteam',
    '@scoped/another'
  ], (err) => {
    t.match(
      err,
      /Usage: First argument must be either `read-only` or `read-write`./,
      'should throw unrecognized argument error'
    )
    t.end()
  })
})

test('access grant missing team args', (t) => {
  const access = emptyMock

  access([
    'grant',
    'read-only',
    undefined,
    '@scoped/another'
  ], (err) => {
    t.match(
      err,
      /Usage: `<scope:team>` argument is required./,
      'should throw missing argument error'
    )
    t.end()
  })
})

test('access grant malformed team arg', (t) => {
  const access = emptyMock

  access([
    'grant',
    'read-only',
    'foo',
    '@scoped/another'
  ], (err) => {
    t.match(
      err,
      /Usage: Second argument used incorrect format.\n/,
      'should throw malformed arg error'
    )
    t.end()
  })
})

test('access revoke', (t) => {
  t.plan(4)
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      revoke: (spec, team) => {
        t.equal(spec, '@scoped/another', 'should use expected spec')
        t.equal(team, 'myorg:myteam', 'should use expected team')
        return true
      }
    },
    '../../lib/npm.js': {}
  })
  access([
    'revoke',
    'myorg:myteam',
    '@scoped/another'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access revoke')
  })
})

test('access revoke missing team args', (t) => {
  const access = emptyMock

  access([
    'revoke',
    undefined,
    '@scoped/another'
  ], (err) => {
    t.match(
      err,
      /Usage: `<scope:team>` argument is required./,
      'should throw missing argument error'
    )
    t.end()
  })
})

test('access revoke malformed team arg', (t) => {
  const access = emptyMock

  access([
    'revoke',
    'foo',
    '@scoped/another'
  ], (err) => {
    t.match(
      err,
      /Usage: First argument used incorrect format.\n/,
      'should throw malformed arg error'
    )
    t.end()
  })
})

test('npm access ls-packages with no team', (t) => {
  t.plan(3)
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      lsPackages: (entity) => {
        t.equal(entity, 'foo', 'should use expected entity')
        return {}
      }
    },
    '../../lib/utils/get-identity.js': () => Promise.resolve('foo'),
    '../../lib/utils/output.js': () => null,
    '../../lib/npm.js': {}
  })
  access([
    'ls-packages'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access ls-packages with no team')
  })
})

test('access ls-packages on team', (t) => {
  t.plan(3)
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      lsPackages: (entity) => {
        t.equal(entity, 'myorg:myteam', 'should use expected entity')
        return {}
      }
    },
    '../../lib/utils/output.js': () => null,
    '../../lib/npm.js': {}
  })
  access([
    'ls-packages',
    'myorg:myteam'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access ls-packages on team')
  })
})

test('access ls-collaborators on current', (t) => {
  t.plan(3)
  const prefix = t.testdir({
    'package.json': JSON.stringify({
      name: 'yargs'
    })
  })
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      lsCollaborators: (spec) => {
        t.equal(spec, 'yargs', 'should use expected spec')
        return {}
      }
    },
    '../../lib/utils/output.js': () => null,
    '../../lib/npm.js': { prefix }
  })
  access([
    'ls-collaborators'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access ls-collaborators on current')
  })
})

test('access ls-collaborators on spec', (t) => {
  t.plan(3)
  const access = requireInject('../../lib/access.js', {
    'libnpmaccess': {
      lsCollaborators: (spec) => {
        t.equal(spec, 'yargs', 'should use expected spec')
        return {}
      }
    },
    '../../lib/utils/output.js': () => null,
    '../../lib/npm.js': {}
  })
  access([
    'ls-collaborators',
    'yargs'
  ], (err) => {
    t.ifError(err, 'npm access')
    t.ok('should successfully access ls-packages with no team')
  })
})
