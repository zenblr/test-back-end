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
        },
        cinNumber: {
            type: DataTypes.STRING,
            field: 'cin_number',
        },
        constitutionsDeed: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'constitutions_deed',
        },
        gstCertificate: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'gst_certificate',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        createdByCustomer: {
            type: DataTypes.INTEGER,
            field: 'created_by_customer',
            allowNull: false,
        },
        modifiedByCustomer: {
            type: DataTypes.INTEGER,
            field: 'modified_by_customer',
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

    CustomerKycOrganizationDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));

        let gstCertificateImages = []
        if (values.gstCertificate && values.gstCertificate.length != 0) {
            for (imgUrl of values.gstCertificate) {
                let URL = process.env.BASE_URL + imgUrl;
                gstCertificateImages.push(URL)
            }
        values.gstCertificateImages = gstCertificateImages
        }

        let constitutionsDeedImages = []
        if (values.constitutionsDeed && values.constitutionsDeed.length != 0) {
            for (imgUrl of values.constitutionsDeed) {
                let URL = process.env.BASE_URL + imgUrl;
                constitutionsDeedImages.push(URL)
            }
        values.constitutionsDeedImages = constitutionsDeedImages
        }

        return values;
    }

    return CustomerKycOrganizationDetail;
}