const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { readDeductionDetails, getByDeductionId, updateDeduction, deleteDeduction, addDeduction } = require('../../controllers/scrap/standardDeduction/standardDeduction'); // IMPORTING LOAN PROCESS FUNCTIONS

const { scrapDeductionValidation } = require('../../validations/scrap/scrapDeduction');

const validationError = require('../../middleware/validationError');

const checkAuth = require('../../middleware/checkAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.post('/', checkAuth, scrapDeductionValidation, validationError, wrapper(addDeduction)); // ADD DEDUCTION BASIC DETAIL

route.get('/', checkAuth, wrapper(readDeductionDetails)); // FETCH DEDUCTION DETAILS

route.get('/:id', checkAuth, wrapper(getByDeductionId)); // FETCH SINGLE DEDUCTION DETAILS

route.put('/:id', checkAuth, scrapDeductionValidation, validationError, wrapper(updateDeduction)); // UPDATE DEDUCTION BASIC DETAIL

route.delete('/:id', checkAuth, wrapper(deleteDeduction)); // DELETE DEDUCTION BASIC DETAIL

module.exports = route; // EXPORTING ALL ROUTES