const uuidAPIKey = require('uuid-apikey');


exports.apiKeyGenerate = async (req, res) => {

    try {
        
        const apiKey = uuidAPIKey.create();

        return res.status(200).json({ data: apiKey });
    } catch (err) {

        return res.status(400).json({ message: err.message });    
    };
}