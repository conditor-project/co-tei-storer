'use strict';

const business = module.exports = {};

const _                   = require('lodash'),
      fs                  = require('fs-extra'),
      recordsManager      = require('./src/recordsManager'),
      bulkResponseHandler = require('./src/bulkResponseHandler')
;

business.doTheJob = function(docObject, cb) {

  return cb();
};

business.finalJob = function(docObjects, cb) {
  let errorDocObjects = [];

  const promises = docObjects.map((docObject) => {
    return fs.readFile(docObject.path, 'base64')
             .then((result) => {
               docObject.teiBlob = result;
               return docObject;
             })
             .catch((err) => {
               docObject.error = err;
               errorDocObjects.push(docObject);
               _.pull(docObjects, docObject);
             });
  });

  Promise
    .all(promises)
    .then((docObjects) => {
      return recordsManager.updateRecords(docObjects);
    })
    .then((response) => {
      if (!response.errors) return;
      const errorItems = bulkResponseHandler.filterErrorItems(response);
      const bulkErrorDocObjects = bulkResponseHandler.removeErrorDocObjects(docObjects, errorItems);
      errorDocObjects = errorDocObjects.concat(bulkErrorDocObjects);

    })
    .then(() => {
      _cleanUpDocObjects(docObjects, errorDocObjects);
      return cb(errorDocObjects);
    })
    .catch(cb)
  ;

};

function _cleanUpDocObjects (docObjects, errorDocObjects) {
  _.forEach(docObjects, (docObject) => {
    _.unset(docObject, 'teiBlob');
    docObject.hasStoredTei = true;
  });
  _.forEach(errorDocObjects, (docObject) => {
    _.unset(docObject, 'teiBlob');
    docObject.hasStoredTei = false;
  });
}
