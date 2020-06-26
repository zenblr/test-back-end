const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const CustomerLoanPackageDetails = sequelize.define('customerLoanPackageDetails', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        packetId: {
            type: DataTypes.INTEGER,
            field: 'packet_id',
            allowNull: false
        },
        emptyPacketWithNoOrnament: {
            type: DataTypes.INTEGER,
            field: 'empty_packet_with_no_ornament'
        },
        packetWithAllOrnaments: {
            type: DataTypes.INTEGER,
            field: 'packet_with_all_ornaments'
        },
        packetWithSealing: {
            type: DataTypes.INTEGER,
            field: 'packet_with_sealing'
        },
        packetWithWeight: {
            type: DataTypes.INTEGER,
            field: 'packet_with_weight'
        },
        ornamentsId: {
            type: DataTypes.INTEGER,
            field: 'ornaments_id'
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
        CustomerLoanPackageDetails.belongsTo(models.packet, { foreignKey: 'packetId', as: 'packet' });

        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'emptyPacketWithNoOrnament', as: 'emptyPacketWithNoOrnamentData' });
        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'packetWithAllOrnaments', as: 'packetWithAllOrnamentsData' });
        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'packetWithSealing', as: 'packetWithSealingData' });
        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'packetWithWeight', as: 'packetWithWeightData' });

    }

    CustomerLoanPackageDetails.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.emptyPacketWithNoOrnamentData) {
            values.emptyPacketWithNoOrnamentData.URL = baseUrlConfig.BASEURL + values.emptyPacketWithNoOrnamentData.url;
            let filePath = values.emptyPacketWithNoOrnamentData.url;
            let pathToadd = filePath.replace('public/', '');
            values.emptyPacketWithNoOrnamentData.URL = baseUrlConfig.BASEURL + pathToadd;
        }
        if (values.packetWithAllOrnamentsData) {
            values.packetWithAllOrnamentsData.URL = baseUrlConfig.BASEURL + values.packetWithAllOrnamentsData.url;
            let filePath = values.packetWithAllOrnamentsData.url;
            let pathToadd = filePath.replace('public/', '');
            values.packetWithAllOrnamentsData.URL = baseUrlConfig.BASEURL + pathToadd;
        }
        if (values.packetWithSealingData) {
            values.packetWithSealingData.URL = baseUrlConfig.BASEURL + values.packetWithSealingData.url;
            let filePath = values.packetWithSealingData.url;
            let pathToadd = filePath.replace('public/', '');
            values.packetWithSealingData.URL = baseUrlConfig.BASEURL + pathToadd;
        }
        if (values.packetWithWeightData) {
            values.packetWithWeightData.URL = baseUrlConfig.BASEURL + values.packetWithWeightData.url;
            let filePath = values.packetWithWeightData.url;
            let pathToadd = filePath.replace('public/', '');
            values.packetWithWeightData.URL = baseUrlConfig.BASEURL + pathToadd;
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