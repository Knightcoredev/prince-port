import dbConnect from '../../../lib/dbConnect';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';
import { authenticate } from '../../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return authenticate(getCart)(req, res);
    case 'POST':
      return authenticate(addToCart)(req, res);
    case 'PUT':
      return authenticate(updateCartItem)(req, res);
    case 'DELETE':
      return authenticate(removeFromCart)(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getCart(req, res) {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name price images inventory');

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }

    // Calculate totals
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    res.status(200).json({
      success: true,
      cart: {
        ...cart.toObject(),
        subtotal,
        tax,
        shipping,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function addToCart(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and has inventory
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
      
      if (product.inventory < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory for requested quantity'
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity: parseInt(quantity)
      });
    }

    await cart.save();
    await cart.populate('items.productId', 'name price images inventory');

    res.status(200).json({
      success: true,
      cart,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function updateCartItem(req, res) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or quantity'
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Check inventory
      const product = await Product.findById(productId);
      if (product.inventory < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory'
        });
      }

      cart.items[itemIndex].quantity = parseInt(quantity);
    }

    await cart.save();
    await cart.populate('items.productId', 'name price images inventory');

    res.status(200).json({
      success: true,
      cart,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function removeFromCart(req, res) {
  try {
    const { productId } = req.query;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId', 'name price images inventory');

    res.status(200).json({
      success: true,
      cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}