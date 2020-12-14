const models = require('../models');

let verifyName = async (name) => {
    // const karzaDetail = await models.karzaDetails.findOne({
    //     where: {
    //         isActive: true, env: process.env.KARZA_ENV

    //     }
    // });

    try {
        const result = await models.axios({
            method: 'POST',
            url: karzaDetail ,
            headers: {
                'x-karza-key': 'https://testapi.karza.in/v2/name' ,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ "name1": name.name1, "name2": name.name2, "type": karzaDetail.type , "preset": karzaDetail.preset  })
        });
        var res = JSON.stringify(result.data)
        var res1 = JSON.parse(res)
        if (res1.result) {
            return { error: false, data: res1.result.score * 100 }
        } else {
            return { error: true }
        }
    } catch (err) {
        throw err;
    }
}
module.exports = {
    verifyPANCard: verifyPANCard,
    verifyName: verifyName
}