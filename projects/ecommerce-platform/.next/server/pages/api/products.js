"use strict";
(() => {
var exports = {};
exports.id = 221;
exports.ids = [221];
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

/***/ 8155:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_dbConnect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(490);
/* harmony import */ var _models_Product__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6335);
/* harmony import */ var _middleware_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3156);



async function handler(req, res) {
    await (0,_lib_dbConnect__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)();
    switch(req.method){
        case "GET":
            return getProducts(req, res);
        case "POST":
            return (0,_middleware_auth__WEBPACK_IMPORTED_MODULE_1__/* .authenticate */ .Y)(createProduct)(req, res);
        default:
            return res.status(405).json({
                message: "Method not allowed"
            });
    }
}
async function getProducts(req, res) {
    try {
        const { page = 1, limit = 12, category, search, minPrice, maxPrice, sortBy = "createdAt", sortOrder = "desc", featured } = req.query;
        const query = {};
        // Build query filters
        if (category) query.category = category;
        if (search) {
            query.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (featured === "true") query.featured = true;
        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {
            [sortBy]: sortOrder === "desc" ? -1 : 1
        };
        const [products, total] = await Promise.all([
            _models_Product__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit)).populate("category", "name slug"),
            _models_Product__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z.countDocuments(query)
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
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
async function createProduct(req, res) {
    try {
        const { name, description, price, category, images, inventory, sku, featured = false, specifications = {} } = req.body;
        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }
        // Create product
        const product = new _models_Product__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z({
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
        await product.populate("category", "name slug");
        res.status(201).json({
            success: true,
            product,
            message: "Product created successfully"
        });
    } catch (error) {
        console.error("Error creating product:", error);
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
var __webpack_exports__ = (__webpack_exec__(8155));
module.exports = __webpack_exports__;

})();