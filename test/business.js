'use strict';

const
  absolute            = require('../helpers/absolute'),
  business            = require('../index.js'),
  should              = require('should'), // jshint ignore:line
  _                   = require('lodash'),
  createIndiceNx      = require('../helpers/createIndiceNx'),
  deleteIndiceIx      = require('../helpers/deleteIndiceIx'),
  indiceConfig        = require('co-config/mapping'),
  config              = require('config-component').get(),
  recordsManager      = require('../src/recordsManager'),
  bulkResponseHandler = require('../src/bulkResponseHandler')
;

const indiceName = config.elastic.indiceName;

const docObjects =
        _(new Array(3))
          .map((value, key) => {
            return {
              path           : absolute(__dirname, `./assets/00${key + 1}.xml`),
              idElasticsearch: key
            };
          })
          .value()
;

describe('doTheJob(docObject:Object)', function() {
  before(function() {
    return createIndiceNx(indiceName, indiceConfig)
      .then(() => {
        return recordsManager
          .indexRecords(docObjects)
          .then((response) => {
            const errorItems      = bulkResponseHandler.filterErrorItems(response),
                  errorDocObjects = bulkResponseHandler.removeErrorDocObjects(docObjects, errorItems);

            if (errorDocObjects.length) throw errorDocObjects;
          });
      });
  });

  after(function() {
    return deleteIndiceIx(indiceName);
  });

  it('Should stores TEI content from the DocObject into the TEI index', function(done) {
    business.finalJob(docObjects, function(errs) {
      if (!_.isEmpty(errs) || _.isError(errs)) {
        return done(new Error(JSON.stringify(errs, null, 2)));
      }

      done();
    });
  });


});
