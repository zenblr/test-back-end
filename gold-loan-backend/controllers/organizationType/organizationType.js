const models = require('../../models'); // importing models.

exports.addUpdateOrganisationType = async (req, res, next) => {
    const { organizationType } = req.body;
    
    let organizationTypeData = await models.organizationType.readOrganizationType()
    if (organizationTypeData.length == 0) {

        let CreatedOrganizationType = await models.organizationType.addOrganizationType(organizationType);

        if (!CreatedOrganizationType) {
            res.status(422).json({ message: 'Organization type not added' });
        } else {
            res.status(201).json(CreatedOrganizationType)
        }
    } else {
        let id = organizationTypeData[0].id;
        let UpdateData = await models.organizationType.updateOrganizationType(id, organizationType)

        if (UpdateData[0] === 0) {
            return res.status(404).json({ message: 'Data not updated' });
        }
        return res.status(200).json({ message: 'Success' });

    }
}

exports.readOrganizationType = async (req, res, next) => {
    let organizationType = await models.organizationType.findAll({

    })

    if (!organizationType) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(organizationType);
    }

};

