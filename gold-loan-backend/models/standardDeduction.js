module.exports = (sequelize, DataTypes) => {
    const StandardDeduction = sequelize.define('standardDeduction', {
        standardDeduction: {
            type: DataTypes.FLOAT,
            field: 'standard_deduction'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_standard_deduction',
    });

    return StandardDeduction;
}