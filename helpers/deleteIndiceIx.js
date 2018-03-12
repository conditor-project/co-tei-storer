'use strict';


const esClient = require('../src/esClient')
;

module.exports = function deleteIndiceIx (indiceName) {
    return esClient
      .indices
      .exists({index: indiceName})
      .then((doesExist) => {
        if (!doesExist) return doesExist;
        return esClient
          .indices
          .delete({index: indiceName})
          ;
      });
};
