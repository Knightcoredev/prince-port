"use strict";
(() => {
var exports = {};
exports.id = 756;
exports.ids = [756];
exports.modules = {

/***/ 2140:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            message: "Method not allowed"
        });
    }
    try {
        const { items } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "No items in cart"
            });
        }
        // Calculate total
        const total = items.reduce((sum, item)=>sum + item.price * item.quantity, 0);
        // Generate order ID
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // In a real app, you would:
        // 1. Validate inventory
        // 2. Process payment
        // 3. Save order to database
        // 4. Send confirmation email
        // Simulate processing delay
        await new Promise((resolve)=>setTimeout(resolve, 1000));
        // Mock order data
        const order = {
            id: orderId,
            items,
            total: total.toFixed(2),
            status: "confirmed",
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        res.status(200).json({
            success: true,
            order,
            message: "Order placed successfully!"
        });
    } catch (error) {
        console.error("Checkout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
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
var __webpack_exports__ = (__webpack_exec__(2140));
module.exports = __webpack_exports__;

})();