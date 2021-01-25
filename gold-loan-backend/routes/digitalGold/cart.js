// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { createCart, readCart, getCartCount, updateQuantity, deleteFromCart, reAddItemsToCart} = require('../../controllers/digitalGold/cart/cart');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/', customerCheckAuth, wrapper(createCart)); 

route.post('/re-order', customerCheckAuth, wrapper(reAddItemsToCart)); 

route.get('/', customerCheckAuth, wrapper(readCart));

route.get('/cart-count', customerCheckAuth, wrapper(getCartCount));

route.put('/:productSku', customerCheckAuth, wrapper(updateQuantity));

route.delete('/:productSku', customerCheckAuth, wrapper(deleteFromCart));

module.exports = route; // EXPORTING ALL ROUTES
