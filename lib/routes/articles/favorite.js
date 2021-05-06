'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const Article = require('../../models/article');
const ArticleDetailed = require('../../dtos/article-detailed');
const ArticleUpdated = require('../../dtos/article-response');

module.exports = Helpers.withDefaults({
    method: 'post',
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

            const favoriteAndFetchArticle = async (txn) => {

                await articleService.favorite(currentUserId, article.id, txn);

                return await articleService.fetchArticlesByUser(currentUserId, article, txn);
            };

            const favorited = await h.context.transaction(favoriteAndFetchArticle);

            return ArticleUpdated.from({
                article: ArticleDetailed.from(favorited)
            });
        }
    }
});
