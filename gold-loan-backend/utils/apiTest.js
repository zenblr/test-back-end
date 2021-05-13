const async = require('async');
const request = require('request');
const getMerchantData = require('../controllers/auth/getMerchantData');

//Set whatever request options you like, see: https://github.com/request/request#requestoptions-callback


exports.getGoldSilverRatetest = async (req, res) => {

    const merchantData = await getMerchantData();

    var requestArray =
        Array(100).fill({
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/rates`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${merchantData.accessToken}`,
            }
        })
        ;

    let getApi = function (opt, callback) {
        request(opt, (err, response, body) => {
            callback(err, JSON.parse(body));
        });
    };

    const functionArray = requestArray.map((opt) => {
        return (callback) => getApi(opt, callback);
    });

    async.parallel(
        functionArray, (err, results) => {
            if (err) {
                console.error('Error: ', err);
            } else {
                console.log('Results: ', results.length, JSON.stringify(results[0].result.data.rates));
            }
        });

}

