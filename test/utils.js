"use strict";

require('co-mocha');

var chai = require('chai'),
  path = require('path'),
  sinon = require('sinon'),
  Q = require('bluebird'),
  rethinkdb = require('rethinkdbdash');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

exports.assert = chai.assert;
exports.expect = chai.expect;
exports.should = chai.should();

exports.sinon = sinon;

exports.Thinodium = require('thinodium');
exports.Plugin = require('../');





disconnectTestDb = function(dbToDelete) {
  return dbConnection.getPoolMaster().drain();
};



exports.createTest = function(_module) {
  var test = _module.exports = {};

  const utilityMethods = {
    connect: function() {
      return new Q((resolve, reject) => {
        let connected = false;

        this._r = rethinkdb();

        this._r.getPoolMaster().on('available-size', (size) => {
          if (connected) {
            return;
          }

          connected = true;

          resolve();
        });

        this._r.getPoolMaster()._flushErrors = () => {};

        this._r.getPoolMaster().on('healthy', (healthy) => {
          if (healthy) {
            resolve();
          } else {
            reject(new Error(`Connection failed`);
          }
        });
      });
    },
    disconnect: function() {
      if (!this._r) {
        return Q.resolve();
      }

      return Q.resolve(this._r.getPoolMaster().drain());
    },
    createDb: function(dbName) {
      return this._r.dbList()
        .then((dbList) => {
          if (0 > dbList.indexOf(dbName)) {
            return this._r.dbCreate(dbName);
          }
        });
    },
    dropDb: function(dbName) {
      return this._r.dbList()
        .then((dbList) => {
          if (0 <= dbList.indexOf(dbName)) {
            return this._r.dbDrop(dbName);
          }
        });
    },
  };


  var testMethods = {};
  
  test[path.basename(_module.filename)] = {
    beforeEach: function*() {
      this.mocker = sinon.sandbox.create();

      _.each(utilityMethods, (k, m) => {
        this[k] = _.bind(m, this);
      });

      yield this.connect();
    },
    afterEach: function*() {
      yield this.disconnect();

      this.mocker.restore();
    },
    'tests': testMethods
  };

  return testMethods;
};
