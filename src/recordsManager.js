'use strict';

const recordsManager = module.exports = {};

const esClient          = require('./esClient'),
      recordsRepository = require('./recordsRepository'),
      config            = require('config-component').get(module)
;

const getBulkParams = () => {
  return {
    index: config.elastic.indiceName,
    type : 'record'
  };
};

recordsManager.updateRecords = function(docObjects) {
  const params = getBulkParams();
  params.body = recordsRepository.buildUpdateTeiBody(docObjects);

  return esClient.bulk(params);
};

recordsManager.indexRecords = function(docObjects) {
  const params = getBulkParams();
  params.body = recordsRepository.buildIndexBody(docObjects);

  return esClient.bulk(params);
};
