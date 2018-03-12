'use strict';

const
  absolute          = require('../helpers/absolute'),
  business          = require('../index.js'),
  should            = require('should'), // jshint ignore:line
  _                 = require('lodash'),
  esClient          = require('../src/esClient'),
  recordsRepository = require('../src/recordsRepository'),
  createIndiceNx    = require('../helpers/createIndiceNx'),
  deleteIndiceIx    = require('../helpers/deleteIndiceIx'),
  indiceConfig      = require('co-config/mapping')
;

const docObjects =
        _(new Array(4))
          .map((value, key) => {
            return {
              path           : absolute(__dirname, `./assets/00${key}.xml`),
              idElasticsearch: key
            };
          })
          .value()
;

describe('doTheJob(docObject:Object)', function() {
  before(function() {
    return createIndiceNx('records', indiceConfig)
      .then(() => {
        const body = recordsRepository.buildIndexBody(docObjects);
        return esClient
          .bulk({body: body})
          .then((response) => {
            const bulkErrors      = _getBulkErrors(response),
                  errorDocObjects = _getErrorDocObject(docObjects, bulkErrors);
            if(errorDocObjects.length) throw errorDocObjects;
          });
      });
  });

  function _getBulkErrors (response) {
    if (!response.errors) return;
    return _.filter(
      _.get(response, 'items', []),
      (item) => {
        return _(_.find(item)).get('error');
      });
  }

  function _getErrorDocObject (docObjects, bulkErrors) {
    return _.intersectionWith(docObjects,
                              bulkErrors,
                              (docObject, error) => {
                                if (!_.isFinite(docObject.idElasticsearch)
                                    && !_.isString(docObject.idElasticsearch)
                                ) return false;

                                if (docObject.idElasticsearch === +_.get(_.find(error), '_id')) {
                                  docObject.error = _.get(_.find(error), 'error');
                                  return true;
                                }
                              });
  }

  it('Should stores TEI content from the DocObject into the TEI index', function(done) {
    business.finalJob(docObjects, function(errs) {
      if (!_.isEmpty(errs) || _.isError(errs)) {
        console.error(errs);
        return done(new Error());
      }

      done();
    });
  });
});
