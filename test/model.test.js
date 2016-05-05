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


test['model'] = {
  beforeEach: function*() {
    this.db = new Database();

    yield this.db.connect({
      db: 'thinodium_rethinkdb_test',
    });

    this.model = yield this.db.model('test');
  },

  afterEach: function*() {
    yield this.db.disconnect();
    
    yield this.dropDb('thinodium_rethinkdb_test');
  },

  'can do a raw query': function*() {
    let ret = yield this.model._qry().insert({
      name: 'john'
    }).run();

    ret.generated_keys.should.be.defined;
  },

  'can insert': function*() {
    let doc = yield this.model._insert({
      name: 'john'
    });

    doc.id.should.be.defined;
  },

  'can get by id': function*() {
    let doc = yield this.model._insert({
      name: 'john'
    });

    let newdoc = yield this.model._get(doc.id);

    newdoc.id.should.be.defined;
    newdoc.name.should.eql('john');
  },

  'can update': function*() {
    let doc = yield this.model._insert({
      name: 'john'
    });

    yield this.model._update(doc.id, {
      name: 'mark'
    });

    let newdoc = yield this.model._get(doc.id);

    expect(newdoc.name).to.eql('mark');
  },

  'can remove': function*() {
    let doc = yield this.model._insert({
      name: 'john'
    });

    yield this.model._remove(doc.id);

    let newdoc = yield this.model._get(doc.id);

    expect(newdoc).to.be.null;
  },

};



test['model with schema'] = {
  beforeEach: function*() {
    this.db = new Database();

    yield this.db.connect({
      db: 'thinodium_rethinkdb_test',
    });

    this.model = yield this.db.model('test', {
      schema: {
        title: {
          type: String,
          enum: ['mr', 'mrs'],
        },
        age: {
          type: Number,
          required: true,
        },
      },
    });

    let ret = yield this._r.db('thinodium_rethinkdb_test').table('test').insert({
      name: 'tom',
    });

    this._id = ret.generated_keys[0];
  },

  afterEach: function*() {
    yield this.db.disconnect();
    
    yield this.dropDb('thinodium_rethinkdb_test');
  },

  'bad insert': function*() {
    try {
      yield this.model._insert({
        name: 'john',
        title: 'test',
      });

      throw new Error('should have failed');
    } catch (err) {
      if (0 <= err.toString().indexOf('should have faild')) {
        throw err;
      }
    }
  },

  'good insert': function*() {
    yield this.model._insert({
      name: 'john',
      age: 19,
    });
  },

  'bad update': function*() {
    try {
      yield this.model._update(this._id, {
        age: '23'
      });

      throw new Error('should have failed');
    } catch (err) {
      if (0 <= err.toString().indexOf('should have faild')) {
        throw err;
      }
    }
  },

  'good update': function*() {
    yield this.model._update(this._id, {
      title: 'mrs',
      age: 19,
    });
  },
};



