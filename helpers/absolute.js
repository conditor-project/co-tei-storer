'use strict';
const path = require('path');

module.exports = function _absolute(){
  return  path.join('/',path.relative('/', path.join(...arguments)));
};
