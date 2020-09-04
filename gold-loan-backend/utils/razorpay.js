let Razorpay = require('razorpay');

const razorPayConfig = {
    key_id: 'rzp_test_FvEtFgQ5WnMZ7J',
    key_secret: '3Hhh6UQD9jZKLC1YxjKeO2IS'
}

let instance = new Razorpay(razorPayConfig);

module.exports = {
    instance: instance,
    razorPayConfig: razorPayConfig
}