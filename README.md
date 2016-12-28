# Thinodium RethinkDB adapter

[![Build Status](https://travis-ci.org/hiddentao/thinodium-rethinkdb.svg?branch=master)](http://travis-ci.org/hiddentao/thinodium-rethinkdb)
[![npm](https://img.shields.io/npm/v/thinodium.svg?maxAge=2592000)](https://www.npmjs.com/package/thinodium-rethinkdb)
[![Join the chat at https://discord.gg/bYt4tWB](https://img.shields.io/badge/discord-join%20chat-738bd7.svg?style=flat-square)](https://discord.gg/bYt4tWB)
[![Follow on Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/hiddentao)

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
const Thinodium = require('thinodium');

const db = yield Thinodium.connect('rethinkdb', {
  // db name
  db: 'mydb',
  /* all options get passed to rethinkdbdash module */
  ...
});

/*
  This will create the "User" table and all specifies indexes if they
  don't already exist.
 */
const User = yield db.model('User', {
  indexes: [
    // single-value field
    {
      name: 'username',
    },
    // a multivalue field
    {
      name: 'roles',
      options: {
        multi: true,
      },
    },  
    // totally custom indexing function
    {
      name: 'email',
      def: function(doc) {
        return doc('emails')('email');
      },
      options: {
        multi: true,
      },
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

To run the tests you will need [RethinkDB](https://www.rethinkdb.com/) installed
and running with default host and port settings. Then on the command-line:

    $ npm install
    $ npm test

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/thinodium-rethinkdb/blob/master/CONTRIBUTING.md).

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/thinodium-rethinkdb/blob/master/LICENSE.md)
