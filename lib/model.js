"use strict";

const _ = require('lodash'),
  Q = require('bluebird'),
  Thinodium = require('thinodium');


class RethinkDBModel extends Thinodium.Model {
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
    return Q.resolve(
      // get list of table
      this.db.tableList()
        .then((tables) => {
          // do we need to create our table?
          if (0 > tables.indexOf(this.name)) {
            return this.db.tableCreate(this.name, {
              primaryKey: this.pk
            });
          }
        })
        .then(() => {
          return this.rawQry().indexList();
        })
        .then((existingIndexes) => {
          let promises = [];

          for (let index of _.get(this._cfg, 'indexes', [])) {
            if (0 > existingIndexes.indexOf(index.name)) {
              promises.push(
                this.rawQry().indexCreate(
                  index.name, index.def, index.options
                ).run()
              );
            }
          }

          if (promises.length) {
            return Q.all(promises);
          }
        })
    );
  }


  /**
   * @override
   */
  rawQry () {
    return this.db.table(this.name);
  }


  /**
   * @override
   */
  rawGet (id) {
    return Q.try(() => {
      if (undefined === id || null === id) {
        return null;
      }

      return this.rawQry().get(id).run();
    });
  }

  /**
   * @override
   */
  rawGetAll () {
    return this.rawQry().run();
  }


  /**
   * @override
   */
  rawInsert (rawDoc) {
    return Q.try(() => {
      if (this.schema) {
        return this.schema.validate(rawDoc);
      }
    })
      .then(() => {
        return this.rawQry().insert(rawDoc).run();
      })
      .then((ret) => {
        let newDoc = _.extend({}, rawDoc);

        if (!newDoc[this.pk] && ret.generated_keys) {
          newDoc[this.pk] = ret.generated_keys[0];
        }

        return newDoc;
      });        
  }

  /**
   * @override
   */
  rawUpdate (id, changes) {
    return Q.try(() => {
      if (this.schema) {
        return this.schema.validate(changes, {
          ignoreMissing: true,
        });
      }
    })
      .then(() => {
        return this.rawQry().get(id).update(changes).run();
      });
  }

  /**
   * @override
   */
  rawRemove (id) {
    return Q.resolve(
      this.rawQry().get(id).delete().run()
    );
  }

};


module.exports = RethinkDBModel;
