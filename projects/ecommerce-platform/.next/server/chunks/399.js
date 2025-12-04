"use strict";
exports.id = 399;
exports.ids = [399];
exports.modules = {

/***/ 399:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ ProductCard)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2322);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _context_CartContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6826);



function ProductCard({ product }) {
    const [imageLoading, setImageLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
    const { addToCart } = (0,_context_CartContext__WEBPACK_IMPORTED_MODULE_2__/* .useCart */ .j)();
    const handleAddToCart = ()=>{
        addToCart(product);
    };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300",
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "relative aspect-square",
                children: [
                    imageLoading && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "absolute inset-0 bg-gray-200 animate-pulse"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("img", {
                        src: product.image,
                        alt: product.name,
                        className: "w-full h-full object-cover",
                        onLoad: ()=>setImageLoading(false),
                        onError: ()=>setImageLoading(false)
                    }),
                    product.discount && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold",
                        children: [
                            "-",
                            product.discount,
                            "%"
                        ]
                    })
                ]
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "p-4",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                        className: "font-semibold text-lg text-gray-900 mb-2 line-clamp-2",
                        children: product.name
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                        className: "text-gray-600 text-sm mb-3 line-clamp-2",
                        children: product.description
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "flex items-center space-x-2",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                        className: "text-xl font-bold text-gray-900",
                                        children: [
                                            "$",
                                            product.price
                                        ]
                                    }),
                                    product.originalPrice && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                        className: "text-sm text-gray-500 line-through",
                                        children: [
                                            "$",
                                            product.originalPrice
                                        ]
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "flex items-center",
                                children: [
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "flex text-yellow-400",
                                        children: [
                                            ...Array(5)
                                        ].map((_, i)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("svg", {
                                                className: `w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "text-gray-300"}`,
                                                viewBox: "0 0 20 20",
                                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("path", {
                                                    d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                                })
                                            }, i))
                                    }),
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                        className: "text-sm text-gray-600 ml-1",
                                        children: [
                                            "(",
                                            product.reviews,
                                            ")"
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                        onClick: handleAddToCart,
                        className: "w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium",
                        children: "Add to Cart"
                    })
                ]
            })
        ]
    });
}


/***/ })

};
;