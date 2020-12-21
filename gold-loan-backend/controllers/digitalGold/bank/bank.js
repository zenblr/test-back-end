const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const pagination = require('../../../utils/pagination');
const errorLogger = require('../../../utils/errorLogger');

exports.getBankList = async(req, res)=>{
    try{
        const merchantData = await getMerchantData();
        let {search, pageSize, pageNumber} = pagination.paginationWithPageNumberPageSize(req.query.search, req.query.page, req.query.count);

        const result = await models.axios({
            method: 'GET',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/master/banks?page=${pageNumber}&count=${pageSize}`,
            headers: {
                'Content-Type': 'application/json', 
                'Accept': 'application/json', 
                'Authorization': `Bearer ${merchantData.accessToken}`, 
            },
        });
        return res.status(200).json(result.data);
    }catch(err){
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
            return res.status(422).json(err.response.data);
        } else {
            console.log('Error', err.message);
        }
    };
}