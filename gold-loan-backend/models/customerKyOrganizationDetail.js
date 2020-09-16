module.exports = (sequelize, DataTypes) => {
    const CustomerKycOrganizationDetail = sequelize.define('customerKycOrganizationDetail', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        customerKycId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_id',
        },
        email: {
            type: DataTypes.STRING,
            field: 'email',
            allowNull: false,
        },
        alternateEmail: {
            type: DataTypes.STRING,
            field: 'alternate_email',
        },
        landLineNumber: {
            type: DataTypes.STRING,
            field: 'land_line_number',
        },
        gstinNumber: {
            type: DataTypes.STRING,
            field: 'gstin_number',
            allowNull: false,
        },
        cinNumber: {
            type: DataTypes.STRING,
            field: 'cin_number',
        },
        constitutionsDeed: {
            type: DataTypes.TEXT,
            field: 'constitutions_deed',
        },
        gstCertificate: {
            type: DataTypes.TEXT,
            field: 'gst_certificate',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false,
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    },
        {
            freezeTableName: true,
            tableName: 'customer_kyc_organization_detail',
        }
    );

    CustomerKycOrganizationDetail.associate = function (models) {
        CustomerKycOrganizationDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        CustomerKycOrganizationDetail.belongsTo(models.customerKyc, { foreignKey: 'customerKycId', as: 'customerKyc' });
       
    }

    return CustomerKycOrganizationDetail;
}