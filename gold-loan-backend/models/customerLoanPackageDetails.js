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
            type: DataTypes.STRING,
            field: 'empty_packet_with_no_ornament'
        },
        packetWithAllOrnaments: {
            type: DataTypes.STRING,
            field: 'packet_with_all_ornaments'
        },
        packetWithSealing: {
            type: DataTypes.STRING,
            field: 'packet_with_sealing'
        },
        packetWithWeight: {
            type: DataTypes.STRING,
            field: 'packet_with_weight'
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