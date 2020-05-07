module.exports = (sequelize, DataTypes) => {
    const LogisticPartner = sequelize.define('logisticPartner', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
            allowNull: false,
        },
        createdBy:{
            type:DataTypes.INTEGER,
            field:'created_by'
        },
        modifiedBy:{
            type:DataTypes.INTEGER,
            field:'modified_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'logistic_partner',
    });

    return LogisticPartner;
}