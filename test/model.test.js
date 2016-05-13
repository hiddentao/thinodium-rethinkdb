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

var Document = utils.Thinodium.Document;


var test = utils.createTest(module);


test['model'] = {
  beforeEach: function*() {
    this.timeout(5000);

    this.db = new Database();

    yield this.db.connect({
      db: 'thinodium_rethinkdb_test',
    });

    this.model = yield this.db.model('test');
  },

  afterEach: function*() {
    this.timeout(5000);

    yield this.db.disconnect();
    
    yield this.dropDb('thinodium_rethinkdb_test');
  },

  'can do a raw query': function*() {
    let ret = yield this.model.rawQry().insert({
      name: 'john'
    }).run();

    ret.generated_keys.should.be.defined;
  },

  'can insert': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    doc.should.be.instanceof(Document);

    doc.id.should.be.defined;
  },

  'can get by id': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    let newdoc = yield this.model.get(doc.id);

    newdoc.should.be.instanceof(Document);

    newdoc.id.should.be.defined;

    newdoc.name.should.eql('john');
  },

  'can get all': function*() {
    let docs = yield [
      this.model.insert({
        name: 'john'
      }),
      this.model.insert({
        name: 'david'
      }),
    ];

    let newdocs = yield this.model.getAll();

    newdocs.length.should.be.eql(2);

    newdocs[0].should.be.instanceof(Document);

    let names = _.map(newdocs, (d) => d.name);
    names.sort();

    names.should.eql(['david', 'john']);
  },

  'can update': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    yield this.model.rawUpdate(doc.id, {
      name: 'mark'
    });

    let newdoc = yield this.model.get(doc.id);

    expect(newdoc.name).to.eql('mark');
  },


  'can remove': function*() {
    let doc = yield this.model.insert({
      name: 'john'
    });

    yield this.model.rawRemove(doc.id);

    let newdoc = yield this.model.get(doc.id);

    expect(newdoc).to.be.null;
  },

};



test['model with schema'] = {
  beforeEach: function*() {
    this.timeout(10000);

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
      yield this.model.insert({
        name: 'john',
        title: 'test',
      });

      throw new Error('FAIL');
    } catch (err) {
      if (0 <= err.toString().indexOf('FAIL')) {
        throw err;
      }
    }
  },

  'good insert': function*() {
    yield this.model.insert({
      name: 'john',
      age: 19,
    });
  },

  'bad update': function*() {
    try {
      yield this.model.rawUpdate(this._id, {
        age: '23'
      });

      throw new Error('FAIL');
    } catch (err) {
      if (0 <= err.toString().indexOf('FAIL')) {
        throw err;
      }
    }
  },

  'good update': function*() {
    yield this.model.rawUpdate(this._id, {
      title: 'mrs',
      age: 19,
    });
  },
};



