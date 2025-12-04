exports.id = 421;
exports.ids = [421];
exports.modules = {

/***/ 6826:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ CartProvider),
/* harmony export */   j: () => (/* binding */ useCart)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2322);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


const CartContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();
const cartReducer = (state, action)=>{
    switch(action.type){
        case "ADD_TO_CART":
            const existingItem = state.items.find((item)=>item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map((item)=>item.id === action.payload.id ? {
                            ...item,
                            quantity: item.quantity + 1
                        } : item)
                };
            }
            return {
                ...state,
                items: [
                    ...state.items,
                    {
                        ...action.payload,
                        quantity: 1
                    }
                ]
            };
        case "REMOVE_FROM_CART":
            return {
                ...state,
                items: state.items.filter((item)=>item.id !== action.payload)
            };
        case "UPDATE_QUANTITY":
            return {
                ...state,
                items: state.items.map((item)=>item.id === action.payload.id ? {
                        ...item,
                        quantity: action.payload.quantity
                    } : item).filter((item)=>item.quantity > 0)
            };
        case "CLEAR_CART":
            return {
                ...state,
                items: []
            };
        case "LOAD_CART":
            return {
                ...state,
                items: action.payload
            };
        default:
            return state;
    }
};
function CartProvider({ children }) {
    const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useReducer)(cartReducer, {
        items: []
    });
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            dispatch({
                type: "LOAD_CART",
                payload: JSON.parse(savedCart)
            });
        }
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        localStorage.setItem("cart", JSON.stringify(state.items));
    }, [
        state.items
    ]);
    const addToCart = (product)=>{
        dispatch({
            type: "ADD_TO_CART",
            payload: product
        });
    };
    const removeFromCart = (productId)=>{
        dispatch({
            type: "REMOVE_FROM_CART",
            payload: productId
        });
    };
    const updateQuantity = (productId, quantity)=>{
        dispatch({
            type: "UPDATE_QUANTITY",
            payload: {
                id: productId,
                quantity
            }
        });
    };
    const clearCart = ()=>{
        dispatch({
            type: "CLEAR_CART"
        });
    };
    const getCartTotal = ()=>{
        return state.items.reduce((total, item)=>total + item.price * item.quantity, 0);
    };
    const getCartItemsCount = ()=>{
        return state.items.reduce((count, item)=>count + item.quantity, 0);
    };
    const value = {
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount
    };
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(CartContext.Provider, {
        value: value,
        children: children
    });
}
const useCart = ()=>{
    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};


/***/ }),

/***/ 7421:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _app)
});

// EXTERNAL MODULE: ../../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(2322);
// EXTERNAL MODULE: ./styles/globals.css
var globals = __webpack_require__(5748);
// EXTERNAL MODULE: ./context/CartContext.js
var CartContext = __webpack_require__(6826);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
;// CONCATENATED MODULE: ./components/Navbar.js



function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = (0,external_react_.useState)(false);
    const { cartItems } = (0,CartContext/* useCart */.j)();
    const cartItemCount = cartItems ? cartItems.reduce((total, item)=>total + item.quantity, 0) : 0;
    return /*#__PURE__*/ jsx_runtime.jsx("nav", {
        className: "bg-white shadow-lg sticky top-0 z-50",
        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
            children: [
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                    className: "flex justify-between h-16",
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            className: "flex items-center",
                            children: [
                                /*#__PURE__*/ jsx_runtime.jsx("div", {
                                    className: "flex-shrink-0",
                                    children: /*#__PURE__*/ jsx_runtime.jsx("h1", {
                                        className: "text-2xl font-bold text-gray-900",
                                        children: "ShopHub"
                                    })
                                }),
                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                    className: "hidden md:ml-6 md:flex md:space-x-8",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime.jsx("a", {
                                            href: "#",
                                            className: "text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium",
                                            children: "Home"
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("a", {
                                            href: "#",
                                            className: "text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium",
                                            children: "Products"
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("a", {
                                            href: "#",
                                            className: "text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium",
                                            children: "Categories"
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("a", {
                                            href: "#",
                                            className: "text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium",
                                            children: "About"
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            className: "flex items-center space-x-4",
                            children: [
                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                    className: "hidden md:flex items-center space-x-4",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime.jsx("input", {
                                            type: "text",
                                            placeholder: "Search products...",
                                            className: "px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("button", {
                                            className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700",
                                            children: "Search"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("button", {
                                    className: "relative p-2 text-gray-600 hover:text-gray-900",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime.jsx("svg", {
                                            className: "w-6 h-6",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                strokeWidth: 2,
                                                d: "M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 4.32a2 2 0 001.92 2.68h9.56M16 13v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H10a2 2 0 00-2 2v4.01"
                                            })
                                        }),
                                        cartItemCount > 0 && /*#__PURE__*/ jsx_runtime.jsx("span", {
                                            className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center",
                                            children: cartItemCount
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ jsx_runtime.jsx("button", {
                                    onClick: ()=>setIsMenuOpen(!isMenuOpen),
                                    className: "md:hidden p-2 text-gray-600 hover:text-gray-900",
                                    children: /*#__PURE__*/ jsx_runtime.jsx("svg", {
                                        className: "w-6 h-6",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M4 6h16M4 12h16M4 18h16"
                                        })
                                    })
                                })
                            ]
                        })
                    ]
                }),
                isMenuOpen && /*#__PURE__*/ jsx_runtime.jsx("div", {
                    className: "md:hidden",
                    children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "px-2 pt-2 pb-3 space-y-1 sm:px-3",
                        children: [
                            /*#__PURE__*/ jsx_runtime.jsx("a", {
                                href: "#",
                                className: "block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600",
                                children: "Home"
                            }),
                            /*#__PURE__*/ jsx_runtime.jsx("a", {
                                href: "#",
                                className: "block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600",
                                children: "Products"
                            }),
                            /*#__PURE__*/ jsx_runtime.jsx("a", {
                                href: "#",
                                className: "block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600",
                                children: "Categories"
                            }),
                            /*#__PURE__*/ jsx_runtime.jsx("a", {
                                href: "#",
                                className: "block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600",
                                children: "About"
                            })
                        ]
                    })
                })
            ]
        })
    });
}

;// CONCATENATED MODULE: ./components/Footer.js

function Footer() {
    return /*#__PURE__*/ jsx_runtime.jsx("footer", {
        className: "bg-gray-900 text-white",
        children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
            children: [
                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                    className: "grid grid-cols-1 md:grid-cols-4 gap-8",
                    children: [
                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            className: "col-span-1 md:col-span-2",
                            children: [
                                /*#__PURE__*/ jsx_runtime.jsx("h3", {
                                    className: "text-2xl font-bold mb-4",
                                    children: "ShopHub"
                                }),
                                /*#__PURE__*/ jsx_runtime.jsx("p", {
                                    className: "text-gray-300 mb-4",
                                    children: "Your one-stop destination for quality products at unbeatable prices. We're committed to providing exceptional customer service and fast delivery."
                                }),
                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                    className: "flex space-x-4",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime.jsx("a", {
                                            href: "#",
                                            className: "text-gray-300 hover:text-white",
                                            children: /*#__PURE__*/ jsx_runtime.jsx("svg", {
                                                className: "w-6 h-6",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                                    d: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("a", {
                                            href: "#",
                                            className: "text-gray-300 hover:text-white",
                                            children: /*#__PURE__*/ jsx_runtime.jsx("svg", {
                                                className: "w-6 h-6",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                                    d: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
                                                })
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("a", {
                                            href: "#",
                                            className: "text-gray-300 hover:text-white",
                                            children: /*#__PURE__*/ jsx_runtime.jsx("svg", {
                                                className: "w-6 h-6",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ jsx_runtime.jsx("path", {
                                                    d: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"
                                                })
                                            })
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ jsx_runtime.jsx("h4", {
                                    className: "text-lg font-semibold mb-4",
                                    children: "Quick Links"
                                }),
                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("ul", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "About Us"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Contact"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "FAQ"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Shipping Info"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Returns"
                                            })
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ jsx_runtime.jsx("h4", {
                                    className: "text-lg font-semibold mb-4",
                                    children: "Categories"
                                }),
                                /*#__PURE__*/ (0,jsx_runtime.jsxs)("ul", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Electronics"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Clothing"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Home & Garden"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Sports"
                                            })
                                        }),
                                        /*#__PURE__*/ jsx_runtime.jsx("li", {
                                            children: /*#__PURE__*/ jsx_runtime.jsx("a", {
                                                href: "#",
                                                className: "text-gray-300 hover:text-white",
                                                children: "Books"
                                            })
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ jsx_runtime.jsx("div", {
                    className: "border-t border-gray-700 mt-8 pt-8",
                    children: /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                        className: "flex flex-col md:flex-row justify-between items-center",
                        children: [
                            /*#__PURE__*/ jsx_runtime.jsx("p", {
                                className: "text-gray-300 mb-4 md:mb-0",
                                children: "\xa9 2024 ShopHub. All rights reserved. | Privacy Policy | Terms of Service"
                            }),
                            /*#__PURE__*/ (0,jsx_runtime.jsxs)("div", {
                                className: "flex items-center space-x-2",
                                children: [
                                    /*#__PURE__*/ jsx_runtime.jsx("span", {
                                        className: "text-gray-400 text-sm",
                                        children: "Crafted by"
                                    }),
                                    /*#__PURE__*/ jsx_runtime.jsx("div", {
                                        className: "bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg tracking-wider shadow-lg",
                                        children: "P.F.O"
                                    })
                                ]
                            })
                        ]
                    })
                })
            ]
        })
    });
}

;// CONCATENATED MODULE: ./pages/_app.js





function MyApp({ Component, pageProps, router }) {
    // Pages that don't need Navbar/Footer
    const noLayoutPages = [
        "/admin"
    ];
    const showLayout = !noLayoutPages.some((page)=>router.pathname.startsWith(page));
    return /*#__PURE__*/ jsx_runtime.jsx(CartContext/* CartProvider */.Z, {
        children: showLayout ? /*#__PURE__*/ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
            children: [
                /*#__PURE__*/ jsx_runtime.jsx(Navbar, {}),
                /*#__PURE__*/ jsx_runtime.jsx(Component, {
                    ...pageProps
                }),
                /*#__PURE__*/ jsx_runtime.jsx(Footer, {})
            ]
        }) : /*#__PURE__*/ jsx_runtime.jsx(Component, {
            ...pageProps
        })
    });
}
/* harmony default export */ const _app = (MyApp);


/***/ }),

/***/ 5748:
/***/ (() => {



/***/ })

};
;