module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('offer', {
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
        tableName: 'loan_offer',
    });

     //Add_Offer
     Offer.addOffer = (images, userId) => Offer.create({ images, userId });

     //Update_Offer
     Offer.updateOffer = (id, images, userId) => Offer.update({ images, userId }, { where: { id } })
 
     //Read_Offer
     Offer.readOffer = () => Offer.findAll();
     
    return Offer;
}