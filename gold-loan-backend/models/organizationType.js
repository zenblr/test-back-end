module.exports = (sequelize, DataTypes) => {
    const OrganizationType = sequelize.define('organizationType', {
        organizationType: {
            type: DataTypes.STRING,
            field: 'organization_type'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    },
        {
            freezeTableName: true,
            tableName: 'organization_type',
        }
    );

        //Add_Banner
        OrganizationType.addOrganizationType = (organizationType) => OrganizationType.create({ organizationType });

        //Update_Banner
        OrganizationType.updateOrganizationType = (id, organizationType) => OrganizationType.update({ organizationType }, { where: { id } })
    
        //Read_Banner
        OrganizationType.readOrganizationType = () => OrganizationType.findAll();

    return OrganizationType;
}