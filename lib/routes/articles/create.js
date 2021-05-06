'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const Tag = require('../../models/tag');
const Article = require('../../models/article');
const ArticleDetailed = require('../../dtos/article-detailed');
const ArticleUpdated = require('../../dtos/article-response');

module.exports = Helpers.withDefaults({
    method: 'post',
    path: '/articles',
    options: {
        validate: {
            payload: Joi.object({
                article: Joi.object().required().keys({
                    title: Article.field('title').required(),
                    description: Article.field('description').required(),
                    body: Article.field('body').required(),
                    tagList: Joi.array().items(Tag.field('name'))
                })
            })
        },
        auth: 'jwt',
        handler: async (request, h) => {

            const { article: articleInfo } = request.payload;
            const { articleService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            const createAndFetchArticle = async (txn) => {

                const id = await articleService.create(currentUserId, articleInfo, txn);
                const entity = await articleService.findById(id, txn);

                return await articleService.fetchArticlesByUser(currentUserId, entity, txn);
            };

            const updated = await h.context.transaction(createAndFetchArticle);

            return ArticleUpdated.from({
                article: ArticleDetailed.from(updated)
            });
        }
    }
});
