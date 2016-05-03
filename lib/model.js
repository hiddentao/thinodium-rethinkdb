"use strict";

const _ = require('lodash'),
  Q = require('bluebird'),
  Thinodium = require('thinodium'),
  Model = Thinodium.Model;


class RethinkDBModel extends Model {
  /**
   * Construct this model instance.
   * 
   * @param  {Object} db  Database connection object.
   * @param  {String} name Table name.
   * @param  {Object} [cfg] Configuration
   * @param  {Object} [cfg.indexes] Indexes to setup.
   */
  constructor (db, name, cfg) {
    cfg = cfg || {};

    if (!cfg.pk) {
      cfg.pk = 'id';
    }

    super(db, name, cfg);
  }


  /**
   * @override
   */
  init () {
    // get list of table
    return this.db.tableList()
      .then((tables) => {
        // do we need to create our table?
        if (0 > tables.indexOf(this.name)) {
          return this.db.tableCreate(this.name, {
            primaryKey: this.pk
          });
        }
      })
      .then(() => {
        return this._qry().indexList();
      })
      .then((existingIndexes) => {
        let promises = [];

        for (let index of this._cfg.indexes) {
          if (0 > existingIndexes.indexOf(index.name)) {
            promises.push(this._qry().indexCreate(
              index.name, index.def, index.options
            ));
          }
        }

        return promises;
      });
  }


  /**
   * @override
   */
  _qry () {
    return this.db.table(this.name);
  }


  /**
   * @override
   */
  _get (id) {
    return Q.try(() => {
      if (undefined === id || null === id) {
        return null;
      }

      return this._qry().get(id).run()
        .then((result) => {
          return this._wrap(result);
        });
    });
  }

  /**
   * @override
   */
  _insert (rawDoc) {
    return Q.try(() => {
      if (this.schema) {
        this.schema.validate(rawDoc);
      }

      return this._qry().insert(rawDoc).run()
        .then((ret) => {
          let newDoc = _.extend({}, rawDoc);

          if (!newDoc[this.pk] && ret.generated_keys) {
            newDoc[this.pk] = ret.generated_keys[0];
          }

          return newDoc;
        });
    });
  }

  /**
   * @override
   */
  _update (id, changes, document) {
    return Q.try(() => {
      if (this.schema) {
        this.schema.validate(changes, {
          ignoreMissing: true,
        });        
      }

      return this._qry().get(id).update(changes).run();
    });
  }

  /**
   * @override
   */
  _remove (id) {
    return this._qry().get(id).delete().run();
  }

};


module.exports = RethinkDBModel;