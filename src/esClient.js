'use strict';

const es     = require('elasticsearch'),
      config = require('config-component').get(module),
      _      = require('lodash')
;

module.exports = new es.Client(_.cloneDeep(config.elastic.clients.main));
