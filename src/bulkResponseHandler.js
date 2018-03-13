'use strict';
const _ = require('lodash');

const bulkResponseHandler = module.exports = {};


bulkResponseHandler.filterErrorItems = function(bulkResponse) {
  if (!bulkResponse.errors) return [];
  return _.filter(
    _.get(bulkResponse, 'items', []),
    (item) => {
      const itemPayload = _.find(item);
      return _(itemPayload).get('error');
    });
};

/**
 * Remove all elements from docObjects than match with errorItems and returns an array of the removed elements.
 * @param {array} docObjects
 * @param {array} errorItems
 *
 */
bulkResponseHandler.removeErrorDocObjects = function(docObjects, errorItems) {
  return _.intersectionWith(docObjects,
                            errorItems,
                            (docObject, errorItem) => {
                              if (!_.has(docObject, 'idElasticsearch')) {
                                return false;
                              }

                              const itemPayload = _.find(errorItem);
                              if (docObject.idElasticsearch === +_.get(itemPayload, '_id')) {
                                docObject.error = _.get(itemPayload, 'error');
                                _.pull(docObjects, docObject);
                                return true;
                              }
                            });
};
