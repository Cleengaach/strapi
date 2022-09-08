'use strict';

/**
 * mountain service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::mountain.mountain');
