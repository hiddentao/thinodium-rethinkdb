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
    
    yield this.dropDb('thinodium-rethinkdb-test');
  },

  'creates db if it does not exist': function*() {
    yield this.db.connect({
      db: 'thinodium-rethinkdb-test',
    });

    let listOfDbs = yield this._r.dbList();

    listOfDbs.should.contain('thinodium-rethinkdb-test');
  },

  'uses db it it already exists': function*() {
    yield this.createDb('thinodium-rethinkdb-test');

    yield this.db.connect({
      db: 'thinodium-rethinkdb-test',
    });
  },
};



