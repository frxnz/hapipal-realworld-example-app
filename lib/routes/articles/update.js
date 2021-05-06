'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');
const Helpers = require('../helpers');
const Article = require('../../models/article');
const Tag = require('../../models/tag');
const ArticleDetailed = require('../../dtos/article-detailed');
const ArticleResponse = require('../../dtos/article-response');

module.exports = Helpers.withDefaults({
    method: 'put',
    path: '/articles/{slug}',
    options: {
        validate: {
            params: Joi.object({
                slug: Article.field('slug')
            }),
            payload: Joi.object({
                article: Joi.object().required().keys({
                    title: Article.field('title'),
                    description: Article.field('description'),
                    body: Article.field('body'),
                    tagList: Joi.array().items(Tag.field('name'))
                })
            })
        },
        auth: 'jwt',
        handler: async (request, h) => {

            const { slug } = request.params;
            const { articleService } = request.services();
            const { article: patch } = request.payload;
            const currentUserId = Helpers.currentUserId(request);

            const article = await articleService.findBySlug(slug);
            const { id, authorId } = article;

            if (authorId !== currentUserId) {
                throw Boom.forbidden();
            }

            const updateAndFetchArticle = async (txn) => {

                await articleService.update(id, patch, txn);

                return articleService.fetchArticlesByUser(currentUserId, article, txn);
            };

            const updated = await h.context.transaction(updateAndFetchArticle);

            return ArticleResponse.from({
                article: ArticleDetailed.from(updated)
            });
        }
    }
});
