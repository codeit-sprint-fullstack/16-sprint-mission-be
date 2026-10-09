import express from 'express';

import {
    createComment,
    loadComments,
    editComment,
    removeComment,
} from '../controllers/comment.product.controller.js';

const router = express.Router();

router.post('/', createComment);
router.get('/', loadComments);
router.patch('/:id', editComment);
router.delete('/:id', removeComment);

export default router;