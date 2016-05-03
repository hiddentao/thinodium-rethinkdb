"use strict";

const _ = require('lodash'),
  rethinkdb = require('rethinkdbdash'),
  EventEmitter = require('eventemitter3'),
  Q = require('bluebird'),
  Database = require('thinodium').Database;

const Model = require('./model');



/**
 * Represents a db model/collection.
 */
class RethinkDB extends Database {
  /**
   * Create a database connection.
   *
   * @param {Object} options connection options (as supported by rethinkdbdash)
   * @param {String} options.db db name
   *
   * @return {Promise} resolves to db connection.
   */
  _connect (options) {
    return new Q((resolve, reject) => {
      let connected = false;

      const r = rethinkdb(options);

      r.getPoolMaster().on('available-size', (size) => {
        if (connected) {
          return;
        }

        connected = true;

        resolve(r);
      });

      r.getPoolMaster()._flushErrors = () => {};

      r.getPoolMaster().on('healthy', (healthy) => {
        if (healthy) {
          resolve(r);
        } else {
          reject(new Error(`Connection failed`);
        }
      });
    })
      .then((r) => {
        return r.dbList()
          .then((dbList) => {
            if (0 > dbList.indexOf(options.db)) {
              return r.dbCreate(options.db);
            }
          })
          .then(() => {
            return r;
          });
      });
  }


  _disconnect (connection) {
    return connection.getPoolMaster().drain();
  }


  _model (connection, name, config) {
    return new Model(connection, name, config);
  }

}


module.exports = RethinkDB;



