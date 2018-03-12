'use strict';


const recordsRepository = module.exports = {};

const _ = require('lodash')
;

recordsRepository.buildUpdateTeiBody = function(docObjects) {
  return _(docObjects)
    .compact()
    .transform(
      (accu, docObject) => {
        accu.push({update: {_index: 'records', _type: 'record', _id: docObject.idElasticsearch}});
        accu.push({doc: {teiBlob: docObject.teiBlob}});
      },
      []
    )
    .value()
    ;
};

recordsRepository.buildIndexBody = function(docObjects) {
  return _(docObjects)
    .compact()
    .transform(
      (accu, docObject) => {
        accu.push({index: {_index: 'records', _type: 'record', _id: docObject.idElasticsearch}});
        accu.push(docObject);
      },
      []
    )
    .value()
    ;
};

recordsRepository.buildDeleteBody = function(docObjects) {
  return _(docObjects)
    .compact()
    .transform(
      (accu, docObject) => {
        accu.push({delete: {_index: 'records', _type: 'record', _id: docObject.idElasticsearch}});
      },
      []
    )
    .value()
    ;
};
