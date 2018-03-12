'use strict';

const business = module.exports = {};

const _                  = require('lodash'),
      fs                 = require('fs-extra'),
      esClient           = require('./src/esClient'),
      buildUpdateTeiBody = require('./src/recordsRepository').buildUpdateTeiBody
;

business.doTheJob = function(docObject, cb) {

  return cb();
};

business.finalJob = function(docObjects, cb) {
  const errorDocObjects = [];
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
    .then((results) => {
      const body = buildUpdateTeiBody(results);

      return esClient.bulk({body: body});
    })
    .then(function(response) {
      console.dir(response, {depth:10})
      _handleBulkUpdateErrors(response, docObjects, errorDocObjects);
      _cleanUpDocObjects(docObjects, errorDocObjects);
      return errorDocObjects;
    })
    .then(cb)
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

function _handleBulkUpdateErrors (response, docObjects, returnErrors) {
  if(!response.errors) return;
  _.intersectionWith(_.clone(docObjects), _.get(response, 'items', []), (docObject, updateItem) => {
    if (docObject.idElasticsearch === +_.get(updateItem, 'update._id')) {
      docObject.error = _.get(updateItem, 'update.error', new Error('Update Error'));
      returnErrors.push(docObject);
      _.pull(docObjects, docObject);
      return true;
    }
  });
}
