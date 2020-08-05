module.exports = (sequelize, DataTypes) => {
    const ScrapPacket = sequelize.define('scrapPacket', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        packetUniqueId: {
            type: DataTypes.STRING,
            field: 'packet_unique_id'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        packetAssigned: {
            type: DataTypes.BOOLEAN,
            field: 'packet_assigned'
        },
        internalUserBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_user_branch_id'
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
    }, {
        freezeTableName: true,
        tableName: 'scrap_packet',
    });

    ScrapPacket.associate = function (models) {
        ScrapPacket.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'customerScrap' });

        ScrapPacket.belongsTo(models.internalBranch, { foreignKey: 'internalUserBranchId', as: 'internalBranch' });
        ScrapPacket.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        ScrapPacket.hasMany(models.scrapPacketOrnament, { foreignKey: 'packetId', as: 'scrapPacketOrnament' });
        ScrapPacket.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });

        // ScrapPacket.belongsToMany(models.customerScrapPackageDetails, { through: models.customerScrapPacket });
        ScrapPacket.belongsToMany(models.customerScrapPackageDetails, {as: 'ScrapPacket',  foreignKey: 'packetId', through: models.customerScrapPacket });
    }

    ScrapPacket.addPacket =
    (packetUniqueId, createdBy, modifiedBy, internalUserBranchId) => ScrapPacket.create({
        packetUniqueId, createdBy, modifiedBy,internalUserBranchId, packetAssigned: false, isActive: true
    });

    ScrapPacket.updatePacket =
        (id, packetUniqueId,internalUserBranchId, modifiedBy) => ScrapPacket.update({ packetUniqueId,internalUserBranchId, modifiedBy }, { where: { id, isActive: true, packetAssigned: false } });


    return ScrapPacket;
}