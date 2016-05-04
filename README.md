# Thinodium RethinkDB adapter

[![Build Status](https://travis-ci.org/hiddentao/thinodium-rethinkdb.svg?branch=master)](http://travis-ci.org/hiddentao/thinodium-rethinkdb)

A RethinkDB adapter for [thinodium](https://github.com/hiddentao/thinodium) 
which internally uses [rethinkdbdash](https://github.com/neumino/rethinkdbdash).

Features:

* Creates tables and indexes if they don't already exist.

## Installation

```bash
$ npm install thinodium thinodium-rethinkdb
```

## Usage examples

```js
const thinodium = require('thinodium');

const db = yield thinodium.connect('rethinkdb', {
  // db name
  db: 'mydb',
  /* all options get passed to rethinkdbdash module */
  ...
});

// get the model and setup indexes
const User = yield db.model('User', {
  indexes: [
    // simple index on username field
    {
      name: 'username',
    },
  ],
});

// insert a new user
let user = yield User.insert({
  name: 'john'
});

// ... normal thinodium API methods available at this point
```

Check out the [thinodium docs](https://hiddentao.github.io/thinodium) for further usage examples and API docs.

## Building

To run the tests you will need [RethinkDB](https://www.rethinkdb.com/) installed and running with default 
host and port settings. Then on the command-line:

    $ npm install
    $ npm test

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/thinodium-rethinkdb/blob/master/CONTRIBUTING.md).

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/thinodium-rethinkdb/blob/master/LICENSE.md)


