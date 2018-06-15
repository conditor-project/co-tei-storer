'use strict';


const
  should         = require('should'), // jshint ignore:line
  createIndiceNx = require('../helpers/createIndiceNx'),
  deleteIndiceIx = require('../helpers/deleteIndiceIx'),
  indiceConfig   = require('co-config/mapping'),
  config         = require('config-component').get(module)
;

const indiceName = config.elastic.indiceName;

describe('createIndiceNx(indiceName:String, indiceConfig:Object)', function() {
  after(function() {
    return deleteIndiceIx(indiceName);
  });

  it('Should create Indice if not exist', function(done) {
    createIndiceNx(indiceName, indiceConfig)
      .then(()=>{done();})
      .catch(done)
    ;
  });

});
