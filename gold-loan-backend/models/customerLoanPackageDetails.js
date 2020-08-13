module.exports = (sequelize, DataTypes) => {
    const CustomerLoanPackageDetails = sequelize.define('customerLoanPackageDetails', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        emptyPacketWithNoOrnament: {
            type: DataTypes.TEXT,
            field: 'empty_packet_with_no_ornament'
        },
        sealingPacketWithWeight: {
            type: DataTypes.TEXT,
            field: 'sealing_packet_with_weight'
        },
        sealingPacketWithCustomer: {
            type: DataTypes.TEXT,
            field: 'sealing_packet_with_customer'
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
        tableName: 'customer_loan_package_details',
    });

    CustomerLoanPackageDetails.associate = function (models) {
        CustomerLoanPackageDetails.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerLoanPackageDetails.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        // CustomerLoanPackageDetails.hasMany(models.customerLoanPacket, { foreignKey: 'customerLoanPackageDetailsId', as: 'customerLoanPacket' });

        CustomerLoanPackageDetails.belongsToMany(models.packet, { through: models.customerLoanPacket, foreignKey: 'customerLoanPackageDetailId' });

    }

    CustomerLoanPackageDetails.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.emptyPacketWithNoOrnament) {
            values.emptyPacketWithNoOrnamentImage = process.env.BASE_URL + values.emptyPacketWithNoOrnament;
        }
        if (values.sealingPacketWithWeight) {
            values.sealingPacketWithWeightImage = process.env.BASE_URL + values.sealingPacketWithWeight;
        }
        if (values.sealingPacketWithCustomer) {
            values.sealingPacketWithCustomerImage = process.env.BASE_URL + values.sealingPacketWithCustomer;
        }

        if (values.packets) {
            for (let i = 0; i < values.packets.length; i++) {
                let pac = values.packets
                if (pac[i].customerLoanOrnamentsDetails) {
                    let orna = pac[i].customerLoanOrnamentsDetails
                    for (let j = 0; j < orna.length; j++) {

                        if (orna[j].weightMachineZeroWeight) {

                            let data = {};
                            data.path = orna[j].weightMachineZeroWeight;
                            data.URL = process.env.BASE_URL + orna[j].weightMachineZeroWeight;
                            orna[j].weightMachineZeroWeightData = data;

                        }
                        if (orna[j].withOrnamentWeight) {

                            let data = {};
                            data.path = orna[j].withOrnamentWeight;
                            data.URL = process.env.BASE_URL + orna[j].withOrnamentWeight;
                            orna[j].withOrnamentWeightData = data;
                        }

                        if (orna[j].stoneTouch) {

                            let data = {};
                            data.path = orna[j].stoneTouch;
                            data.URL = process.env.BASE_URL + orna[j].stoneTouch;
                            orna[j].stoneTouchData = data;
                        }

                        if (orna[j].acidTest) {

                            let data = {};
                            data.path = orna[j].acidTest;
                            data.URL = process.env.BASE_URL + orna[j].acidTest;
                            orna[j].acidTestData = data;
                        }

                        if (orna[j].ornamentImage) {
                            let data = {};
                            data.path = orna[j].ornamentImage;
                            data.URL = process.env.BASE_URL + orna[j].ornamentImage;
                            orna[j].ornamentImageData = data;
                        }

                        let purityTestImage = []
                        let purityTestPath = []
                        let newData = {}

                        if (orna[j].purityTest) {
                            for (imgUrl of orna[j].purityTest) {
                                let URL = process.env.BASE_URL + imgUrl;
                                purityTestImage.push(URL)
                                let path = imgUrl;
                                purityTestPath.push(path)
                                let data = {};
                                data.path = purityTestPath;
                                data.URL = purityTestImage;
                                newData = data;
                            }
                            orna[j].purityTestImage = newData
                        }
    
                    }
                }
            }
        }

        return values;
    }

    // FUNCTION TO ADD PACKAGE IMAGE UPLOAD
    CustomerLoanPackageDetails.addPackageImages =
        (loanId, packageData, createdBy, modifiedBy, t) => {
            let finalPackageData = packageData.map(function (ele) {
                let obj = Object.assign({}, ele);
                obj.isActive = true;
                obj.loanId = loanId;
                obj.createdBy = createdBy;
                obj.modifiedBy = modifiedBy;
                return obj;
            })
            return CustomerLoanPackageDetails.bulkCreate(finalPackageData);
        };

    return CustomerLoanPackageDetails;
}