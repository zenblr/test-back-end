let Razorpay = require('razorpay');

const razorPayConfig = {
    key_id: 'rzp_test_kH2RW0pO6ywG5C',
    key_secret: 'N3j8rEFxrwmJwnxdubZxQXUU'
}

let instance = new Razorpay(razorPayConfig);

module.exports = {
    instance: instance,
    razorPayConfig: razorPayConfig
}