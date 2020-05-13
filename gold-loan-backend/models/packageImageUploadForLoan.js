module.exports = (sequelize, DataTypes) => {
    const packageImageUploadForLoan = sequelize.define('packageImageUploadForLoan', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
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
        packetUniqueId: {
            type: DataTypes.STRING,
            field: 'packet_unique_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'package_image_upload_for_loan',
    });

    // FUNCTION TO ADD PACKAGE IMAGE UPLOAD
    packageImageUploadForLoan.addPackageImages =
        (loanId, packageData, t) => {
            let finalPackageData = packageData.map(function (ele) {
                let obj = Object.assign({}, ele);
                obj.isActive = true;
                obj.loanId = loanId;
                return obj;
            })
            return packageImageUploadForLoan.bulkCreate(finalPackageData);
        };

    return packageImageUploadForLoan;
}