import express from 'express';

import {
    createArticle,
    loadArticleList,
    loadOneArticle,
    editArticle,
    removeArticle
} from '../controllers/article.controller.js';

const router = express.Router();

router.post('/', createArticle);
router.get('/:id', loadOneArticle);
router.get('/', loadArticleList);
router.patch('/:id', editArticle);
router.delete('/:id', removeArticle);

export default router;