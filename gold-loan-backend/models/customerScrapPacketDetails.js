module.exports = (sequelize, DataTypes) => {
    const CustomerScrapPackageDetails = sequelize.define('customerScrapPackageDetails', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        emptyPacketWithRefiningOrnament: {
            type: DataTypes.TEXT,
            field: 'empty_packet_with_refining_ornament'
        },
        sealedPacketWithWeight: {
            type: DataTypes.TEXT,
            field: 'sealed_packet_with_weight'
        },
        sealedPacketWithCustomer: {
            type: DataTypes.TEXT,
            field: 'sealed_packet_with_customer'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_customer_scrap_package_details',
    });

    CustomerScrapPackageDetails.associate = function (models) {
        CustomerScrapPackageDetails.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'customerScrap' });

        // CustomerScrapPackageDetails.hasMany(models.customerLoanPacket, { foreignKey: 'customerLoanPackageDetailsId', as: 'customerLoanPacket' });
    
        CustomerScrapPackageDetails.belongsToMany(models.scrapPacket, {as: 'CustomerScrapPackageDetail',  foreignKey: 'customerScrapPackageDetailId', through: models.customerScrapPacket });

    }

    // CustomerLoanPackageDetails.prototype.toJSON = function () {
    //     var values = Object.assign({}, this.get({ plain: true }));
    //     if (values.emptyPacketWithNoOrnament) {
    //         values.emptyPacketWithNoOrnamentImage = process.env.BASE_URL + values.emptyPacketWithNoOrnament;
    //     }
    //     if (values.sealingPacketWithWeight) {
    //         values.sealingPacketWithWeightImage = process.env.BASE_URL + values.sealingPacketWithWeight;
    //     }
    //     if (values.sealingPacketWithCustomer) {
    //         values.sealingPacketWithCustomerImage = process.env.BASE_URL + values.sealingPacketWithCustomer;
    //     }
      

    //     return values;
    // }

    // FUNCTION TO ADD PACKAGE IMAGE UPLOAD
    // CustomerLoanPackageDetails.addPackageImages =
    //     (loanId, packageData, createdBy, modifiedBy, t) => {
    //         let finalPackageData = packageData.map(function (ele) {
    //             let obj = Object.assign({}, ele);
    //             obj.isActive = true;
    //             obj.loanId = loanId;
    //             obj.createdBy = createdBy;
    //             obj.modifiedBy = modifiedBy;
    //             return obj;
    //         })
    //         return CustomerLoanPackageDetails.bulkCreate(finalPackageData);
    //     };

    return CustomerScrapPackageDetails;
}