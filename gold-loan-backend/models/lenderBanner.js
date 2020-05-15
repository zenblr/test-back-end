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


    //Add_LenderBanner
    LenderBanner.addLenderBanner = (images, userId) => LenderBanner.create({ images, userId });

    //Update_LenderBanner
    LenderBanner.updateLenderBanner = (id, images, userId) => LenderBanner.update({ images, userId }, { where: { id } })

    //Read_LenderBanner
    LenderBanner.readLenderBanner = () => LenderBanner.findAll({attributes: ['id', 'images']});

    return LenderBanner;
}