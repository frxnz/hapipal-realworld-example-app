'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const Article = require('../../models/article');
const ArticleDetailed = require('../../dtos/article-detailed');
const ArticleUpdated = require('../../dtos/article-response');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/articles/{slug}',
    options: {
        validate: {
            params: Joi.object({
                slug: Article.field('slug')
            })
        },
        auth: { strategy: 'jwt', mode: 'optional' },
        handler: async (request, h) => {

            const { slug } = request.params;
            const { articleService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            const fetchAndHydrate = async (txn) => {

                const article = await articleService.findBySlug(slug, txn);

                return await articleService.fetchArticlesByUser(currentUserId, article, txn);
            };

            const hydrated = await h.context.transaction(fetchAndHydrate);

            return ArticleUpdated.from({
                article: ArticleDetailed.from(hydrated)
            });
        }
    }
});
