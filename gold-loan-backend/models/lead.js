module.exports = (sequelize, DataTypes) => {
    const Lead = sequelize.define('lead', {
        // attributes
        leadName: {
            type: DataTypes.TEXT,
            field: 'leadName',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'loan_lead',
    });

    return Lead;
}