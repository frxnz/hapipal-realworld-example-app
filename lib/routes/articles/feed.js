'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const ArticleFeed = require('../../dtos/article-feed');
const ArticleDetailed = require('../../dtos/article-detailed');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/articles/feed',
    options: {
        validate: {
            query: Joi.object({
                limit: Joi.number().integer().min(1).default(20),
                offset: Joi.number().integer().min(0).default(0)
            })
        },
        auth: { strategy: 'jwt', mode: 'optional' },
        handler: async (request) => {

            const { limit, offset } = request.query;
            const { articleService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            // This could probably be combined into one service method, but that's unrelated
            const { articles, total } = await articleService.feed(currentUserId, { limit, offset });
            const hydratedArticles = await articleService.fetchArticlesByUser(currentUserId, articles);

            return ArticleFeed.from({
                articles: hydratedArticles.map((a) => ArticleDetailed.from(a)),
                articlesCount: total
            });
        }
    }
});
