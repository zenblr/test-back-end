module.exports = (sequelize, DataTypes) => {
    const LenderBanner = sequelize.define('lenderBanner', {
        // attributes
        images: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'images'

        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_lender_banner',
    });

    return LenderBanner;
}