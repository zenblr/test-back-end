const baseUrlConfig = require('../config/baseUrl');

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
        packetId: {
            type: DataTypes.INTEGER,
            field: 'packet_id',
            allowNull: false
        },
        emptyPacketWithNoOrnament: {
            type: DataTypes.TEXT,
            field: 'empty_packet_with_no_ornament'
        },
        packetWithAllOrnaments: {
            type: DataTypes.TEXT,
            field: 'packet_with_all_ornaments'
        },
        packetWithSealing: {
            type: DataTypes.TEXT,
            field: 'packet_with_sealing'
        },
        packetWithWeight: {
            type: DataTypes.TEXT,
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
        CustomerLoanPackageDetails.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        CustomerLoanPackageDetails.belongsTo(models.packet, { foreignKey: 'packetId', as: 'packet' });

        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'emptyPacketWithNoOrnament', as: 'emptyPacketWithNoOrnamentData' });
        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'packetWithAllOrnaments', as: 'packetWithAllOrnamentsData' });
        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'packetWithSealing', as: 'packetWithSealingData' });
        CustomerLoanPackageDetails.belongsTo(models.fileUpload, { foreignKey: 'packetWithWeight', as: 'packetWithWeightData' });

    }

    CustomerLoanPackageDetails.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.emptyPacketWithNoOrnament) {
            values.emptyPacketWithNoOrnamentImage = baseUrlConfig.BASEURL + values.emptyPacketWithNoOrnament;
        }
        if (values.packetWithAllOrnaments) {
            values.packetWithAllOrnamentsImage = baseUrlConfig.BASEURL + values.packetWithAllOrnaments;
        }
        if (values.packetWithSealing) {
            values.packetWithSealingImage = baseUrlConfig.BASEURL + values.packetWithSealing;
        }
        if (values.packetWithWeight) {
            values.packetWithWeightImage = baseUrlConfig.BASEURL + values.packetWithWeight;
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