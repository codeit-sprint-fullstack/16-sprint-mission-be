import express from 'express';
import { createProduct, loadOneProduct, loadProductList, editProduct, removeProduct } from '../controllers/product.controller.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/:id', loadOneProduct);
router.get('/', loadProductList);
router.patch('/:id', editProduct);
router.delete('/:id', removeProduct);

export default router;