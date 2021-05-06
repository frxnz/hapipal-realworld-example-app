'use strict';

const Toys = require('@hapipal/toys');
// const Boom = require('@hapi/boom');
// const DTO = require('../dtos/base');

module.exports = Toys.onPostHandler((request, h) => {

    /* Enable this once all the routes are updated to return DTOs */
    // const { response } = request;
    //
    // if (!(response.source instanceof DTO)) {
    //     throw Boom.badImplementation('Response object must be an instance of DTO');
    // }

    return h.continue;
});
