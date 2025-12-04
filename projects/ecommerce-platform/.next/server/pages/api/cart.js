"use strict";
(() => {
var exports = {};
exports.id = 579;
exports.ids = [579];
exports.modules = {

/***/ 490:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ dbConnect)
/* harmony export */ });
// Stub database connection for demo purposes
async function dbConnect() {
    // This is a demo - no actual database connection
    return Promise.resolve();
}


/***/ }),

/***/ 3156:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Y: () => (/* binding */ authenticate)
/* harmony export */ });
// Stub authentication middleware for demo purposes
function authenticate(handler) {
    return async (req, res)=>{
        // Demo mode - create a fake user
        req.user = {
            id: "demo-user-123",
            email: "demo@example.com"
        };
        return handler(req, res);
    };
}


/***/ }),

/***/ 6335:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Stub Product model for demo purposes
class Product {
    constructor(data){
        this.id = data.id;
        this.name = data.name;
        this.price = data.price;
        this.inventory = data.inventory || 100;
    }
    static async findById(id) {
        return new Product({
            id,
            name: "Sample Product",
            price: 29.99,
            inventory: 100
        });
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Product);


/***/ }),

/***/ 5687:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ handler)
});

// EXTERNAL MODULE: ./lib/dbConnect.js
var dbConnect = __webpack_require__(490);
;// CONCATENATED MODULE: ./models/Cart.js
// Stub Cart model for demo purposes
class Cart {
    constructor(data){
        this.userId = data.userId;
        this.items = data.items || [];
    }
    static async findOne() {
        return null;
    }
    async save() {
        return this;
    }
    async populate() {
        return this;
    }
    toObject() {
        return {
            userId: this.userId,
            items: this.items
        };
    }
}
/* harmony default export */ const models_Cart = (Cart);

// EXTERNAL MODULE: ./models/Product.js
var Product = __webpack_require__(6335);
// EXTERNAL MODULE: ./middleware/auth.js
var auth = __webpack_require__(3156);
;// CONCATENATED MODULE: ./pages/api/cart/index.js




async function handler(req, res) {
    await (0,dbConnect/* default */.Z)();
    switch(req.method){
        case "GET":
            return (0,auth/* authenticate */.Y)(getCart)(req, res);
        case "POST":
            return (0,auth/* authenticate */.Y)(addToCart)(req, res);
        case "PUT":
            return (0,auth/* authenticate */.Y)(updateCartItem)(req, res);
        case "DELETE":
            return (0,auth/* authenticate */.Y)(removeFromCart)(req, res);
        default:
            return res.status(405).json({
                message: "Method not allowed"
            });
    }
}
async function getCart(req, res) {
    try {
        let cart = await models_Cart.findOne({
            userId: req.user.id
        }).populate("items.productId", "name price images inventory");
        if (!cart) {
            cart = new models_Cart({
                userId: req.user.id,
                items: []
            });
            await cart.save();
        }
        // Calculate totals
        const subtotal = cart.items.reduce((total, item)=>{
            return total + item.productId.price * item.quantity;
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
        console.error("Error fetching cart:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
async function addToCart(req, res) {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }
        // Check if product exists and has inventory
        const product = await Product/* default */.Z.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        if (product.inventory < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient inventory"
            });
        }
        // Find or create cart
        let cart = await models_Cart.findOne({
            userId: req.user.id
        });
        if (!cart) {
            cart = new models_Cart({
                userId: req.user.id,
                items: []
            });
        }
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex((item)=>item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);
            if (product.inventory < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient inventory for requested quantity"
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
        await cart.populate("items.productId", "name price images inventory");
        res.status(200).json({
            success: true,
            cart,
            message: "Item added to cart"
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
async function updateCartItem(req, res) {
    try {
        const { productId, quantity } = req.body;
        if (!productId || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or quantity"
            });
        }
        const cart = await models_Cart.findOne({
            userId: req.user.id
        });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        const itemIndex = cart.items.findIndex((item)=>item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }
        if (quantity === 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);
        } else {
            // Check inventory
            const product = await Product/* default */.Z.findById(productId);
            if (product.inventory < quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient inventory"
                });
            }
            cart.items[itemIndex].quantity = parseInt(quantity);
        }
        await cart.save();
        await cart.populate("items.productId", "name price images inventory");
        res.status(200).json({
            success: true,
            cart,
            message: "Cart updated successfully"
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
async function removeFromCart(req, res) {
    try {
        const { productId } = req.query;
        const cart = await models_Cart.findOne({
            userId: req.user.id
        });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }
        cart.items = cart.items.filter((item)=>item.productId.toString() !== productId);
        await cart.save();
        await cart.populate("items.productId", "name price images inventory");
        res.status(200).json({
            success: true,
            cart,
            message: "Item removed from cart"
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(5687));
module.exports = __webpack_exports__;

})();