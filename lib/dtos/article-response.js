'use strict';

const Joi = require('joi');
const DTO = require('./base');
const ArticleDetailed = require('./article-detailed');

module.exports = class ArticleResponse extends DTO {

    static schema = Joi.object().required().keys({
        article: ArticleDetailed.schema
    });
};
