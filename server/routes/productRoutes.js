import { Router } from 'express';
import Product from '../models/Product.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

// GET all products with filtering & sorting
router.get('/', async (req, res) => {
  try {
    const { category, q, minPrice, maxPrice, sort } = req.query;
    const filterQuery = {};

    if (category && category !== 'all') {
      filterQuery.category = category;
    }

    if (q) {
      filterQuery.name = { $regex: String(q), $options: 'i' };
    }

    // Handle price range filters
    if (minPrice || maxPrice) {
      filterQuery.price = {};
      if (minPrice) filterQuery.price.$gte = Number(minPrice);
      if (maxPrice) filterQuery.price.$lte = Number(maxPrice);
    }

    let queryBuilder = Product.find(filterQuery);

    // Sorting options
    if (sort) {
      switch (sort) {
        case 'price-asc':
          queryBuilder = queryBuilder.sort({ price: 1 });
          break;
        case 'price-desc':
          queryBuilder = queryBuilder.sort({ price: -1 });
          break;
        case 'rating':
          queryBuilder = queryBuilder.sort({ rating: -1 });
          break;
        case 'newest':
          queryBuilder = queryBuilder.sort({ createdAt: -1 });
          break;
        default: // popular / reviewsCount
          queryBuilder = queryBuilder.sort({ reviewsCount: -1 });
          break;
      }
    } else {
      queryBuilder = queryBuilder.sort({ reviewsCount: -1 });
    }

    const products = await queryBuilder;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.', error: error.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details.', error: error.message });
  }
});

// POST new product (Admin Only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, category, unit, stock, isOrganic, badge } = req.body;
    if (!name || !description || price === undefined || !image || !category || !unit || stock === undefined) {
      return res.status(400).json({ message: 'Missing required product fields.' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      unit,
      stock,
      isOrganic: !!isOrganic,
      badge,
      rating: 4.5,
      reviewsCount: 0
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product.', error: error.message });
  }
});

// PUT update product details (Admin Only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, price, originalPrice, image, category, unit, stock, isOrganic, badge } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (unit !== undefined) product.unit = unit;
    if (stock !== undefined) product.stock = stock;
    if (isOrganic !== undefined) product.isOrganic = !!isOrganic;
    if (badge !== undefined) product.badge = badge;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product.', error: error.message });
  }
});

// DELETE product or mark out of stock (Admin Only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    // We can either delete the product or mark its stock as 0.
    // The frontend has "Mark out of stock" action, let's allow actual deletion or stock updates.
    // To match frontend, we can just delete it completely.
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.', error: error.message });
  }
});

export default router;
