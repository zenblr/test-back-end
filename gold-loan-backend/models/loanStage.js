module.exports = (sequelize, DataTypes) => {
    const LoanStage = sequelize.define('loanStage', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_stage',
    });

    return LoanStage;
}