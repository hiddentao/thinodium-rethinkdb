"use strict";

var _ = require('lodash'),
  Q = require('bluebird');

var utils = require('./utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;

var Plugin = utils.Plugin,
  Database = Plugin.Database,
  Model = Plugin.Model;


var test = utils.createTest(module);



test['connect/disconnect'] = {
  beforeEach: function*() {
    this.db = new Database();
  },

  afterEach: function*() {
    if (this.db) {
      yield this.db.disconnect();
    }
    
    yield this.dropDb('thinodium_rethinkdb_test');
  },

  'creates db if it does not exist': function*() {
    yield this.db.connect({
      db: 'thinodium_rethinkdb_test',
    });

    let listOfDbs = yield this._r.dbList().run();

    listOfDbs.should.contain('thinodium_rethinkdb_test');
  },

  'uses db it it already exists': function*() {
    yield this.createDb('thinodium_rethinkdb_test');

    yield this.db.connect({
      db: 'thinodium_rethinkdb_test',
    });
  },
};


test['model'] = {
  beforeEach: function*() {
    yield this.dropDb('thinodium_rethinkdb_test');

    this.db = new Database();

    yield this.db.connect({
      db: 'thinodium_rethinkdb_test',
    });
  },

  afterEach: function*() {
    yield this.db.disconnect();
    yield this.dropDb('thinodium_rethinkdb_test');
  },

  'will create table': function*() {
    let m = yield this.db.model('test_table');

    let tables = yield this._r.db('thinodium_rethinkdb_test').tableList().run();

    tables.should.contain('test_table');
  },

  'will create indexes': function*() {
    let m = yield this.db.model('test_table', {
      indexes: [
        {
          name: 'value'
        },
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

    let indexes = yield this._r.db('thinodium_rethinkdb_test')
      .table('test_table').indexList().run();

    indexes.should.contain('value');
    indexes.should.contain('email');
  },
}



