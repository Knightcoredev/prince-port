import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import { authenticate } from '../../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    case 'POST':
      return authenticate(createProduct)(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const query = {};
    
    // Build query filters
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (featured === 'true') query.featured = true;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name slug'),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      inventory,
      sku,
      featured = false,
      specifications = {}
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create product
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      images: images || [],
      inventory: parseInt(inventory) || 0,
      sku: sku || `SKU-${Date.now()}`,
      featured,
      specifications,
      createdBy: req.user.id
    });

    await product.save();
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}