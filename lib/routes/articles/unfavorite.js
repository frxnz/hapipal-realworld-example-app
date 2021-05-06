'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const Article = require('../../models/article');
const ArticleDetailed = require('../../dtos/article-detailed');
const ArticleUpdated = require('../../dtos/article-response');

module.exports = Helpers.withDefaults({
    method: 'delete',
    path: '/articles/{slug}/favorite',
    options: {
        validate: {
            params: Joi.object({
                slug: Article.field('slug')
            })
        },
        auth: 'jwt',
        handler: async (request, h) => {

            const { slug } = request.params;
            const { articleService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            const article = await articleService.findBySlug(slug);

            const updateAndHydrate = async (txn) => {

                await articleService.unfavorite(currentUserId, article.id, txn);

                return await articleService.fetchArticlesByUser(currentUserId, article, txn);
            };

            const hydrated = await h.context.transaction(updateAndHydrate);

            return ArticleUpdated.from({
                article: ArticleDetailed.from(hydrated)
            });
        }
    }
});
