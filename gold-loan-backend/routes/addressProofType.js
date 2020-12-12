const { addAddressProofType, readAddressProofType, deactivateAddressProofType } = require('../controllers/addressProofType/addressProofType');
const checkAuth = require('../middleware/checkAuth');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

route.post('/', checkAuth, wrapper(addAddressProofType));// add Identity Type

route.get('/', wrapper(readAddressProofType)); // read Identity Type

route.delete('/', checkAuth, wrapper(deactivateAddressProofType)) // deactive  identity Type

module.exports = route;

