const env = process.env.NODE_ENV || 'development';

let port;
let host;


if (env === 'development') {
    port = '6379';
    host = '127.0.0.1'
}
if (env === 'new') {
    port = '6379';
    host = 'redis'
}
if (env === 'test') {
    port = '6379';
    host = 'redis'
}
if (env === 'uat') {
    port = '6379';
    host = 'augmont-loan-emi-uat-redis.d356pk.0001.aps1.cache.amazonaws.com'
}
if (env === 'production') {
    port = '6379';
    host = 'augmont-loan-emi-prod-redis.d356pk.0001.aps1.cache.amazonaws.com'
}

module.exports = {
    PORT: port,
    HOST: host,

    // HOST: 'redis'
    // git reset--hard

}
