const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const customerLoanOrnamentsDetail = sequelize.define('customerLoanOrnamentsDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        ornamentType: {
            type: DataTypes.STRING,
            field: 'ornament_type'
        },
        quantity: {
            type: DataTypes.STRING,
            field: 'quantity'
        },
        grossWeight: {
            type: DataTypes.STRING,
            field: 'gross_weight'
        },
        netWeight: {
            type: DataTypes.STRING,
            field: 'net_weight'
        },
        deductionWeight: {
            type: DataTypes.STRING,
            field: 'deduction_weight'
        },
        weightMachineZeroWeight: {
            type: DataTypes.INTEGER,
            field: 'weight_machine_zero_weight'
        },
        withOrnamentWeight: {
            type: DataTypes.INTEGER,
            field: 'with_ornament_weight'
        },
        stoneTouch: {
            type: DataTypes.INTEGER,
            field: 'stone_touch'
        },
        acidTest: {
            type: DataTypes.INTEGER,
            field: 'acid_test'
        },
        // purityTest: {
        //     type: DataTypes.ARRAY(DataTypes.INTEGER),
        //     field: 'purity_test'
        // },
        karat: {
            type: DataTypes.STRING,
            field: 'karat'
        },
        purity: {
            type: DataTypes.STRING,
            field: 'purity'
        },
        ltvRange: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            field: 'ltv_range'
        },
        ornamentImage: {
            type: DataTypes.INTEGER,
            field: 'ornament_image'
        },
        ltvPercent: {
            type: DataTypes.STRING,
            field: 'ltv_percent'
        },
        ltvAmount: {
            type: DataTypes.FLOAT,
            field: 'ltv_amount'
        },
        currentLtvAmount: {
            type: DataTypes.FLOAT,
            field: 'current_ltv_amount'
        },
        loanAmount: {
            type: DataTypes.STRING,
            field: 'loan_amount'
        },
        finalNetWeight: {
            type: DataTypes.STRING,
            field: 'final_net_weight'
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
        tableName: 'customer_loan_ornaments_detail',
    });


    customerLoanOrnamentsDetail.associate = function (models) {
        customerLoanOrnamentsDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });

        customerLoanOrnamentsDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoanOrnamentsDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        customerLoanOrnamentsDetail.belongsTo(models.fileUpload, { foreignKey: 'weightMachineZeroWeight', as: 'weightMachineZeroWeightData' });
        customerLoanOrnamentsDetail.belongsTo(models.fileUpload, { foreignKey: 'withOrnamentWeight', as: 'withOrnamentWeightData' });
        customerLoanOrnamentsDetail.belongsTo(models.fileUpload, { foreignKey: 'stoneTouch', as: 'stoneTouchData' });
        customerLoanOrnamentsDetail.belongsTo(models.fileUpload, { foreignKey: 'acidTest', as: 'acidTestData' });
        customerLoanOrnamentsDetail.belongsTo(models.fileUpload, { foreignKey: 'ornamentImage', as: 'ornamentImageData' });


        customerLoanOrnamentsDetail.hasMany(models.purityTestImage, { foreignKey: 'customerLoanOrnamentsDetailId', as: 'purityTestImage' });

    }

    customerLoanOrnamentsDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.withOrnamentWeightData) {
            values.withOrnamentWeightData.URL = baseUrlConfig.BASEURL + values.withOrnamentWeightData.url;
            let filePath = values.withOrnamentWeightData.url;
            let pathToadd = filePath.replace('public/', '');
            values.withOrnamentWeightData.URL = baseUrlConfig.BASEURL + pathToadd;
        }
        if (values.stoneTouchData) {
            values.stoneTouchData.URL = baseUrlConfig.BASEURL + values.stoneTouchData.url;
            let filePath = values.stoneTouchData.url;
            let pathToadd = filePath.replace('public/', '');
            values.stoneTouchData.URL = baseUrlConfig.BASEURL + pathToadd;
        }
        if (values.acidTestData) {
            values.acidTestData.URL = baseUrlConfig.BASEURL + values.acidTestData.url;
            let filePath = values.acidTestData.url;
            let pathToadd = filePath.replace('public/', '');
            values.acidTestData.URL = baseUrlConfig.BASEURL + pathToadd;
        }
        if (values.ornamentImageData) {
            values.ornamentImageData.URL = baseUrlConfig.BASEURL + values.ornamentImageData.url;
            let filePath = values.ornamentImageData.url;
            let pathToadd = filePath.replace('public/', '');
            values.ornamentImageData.URL = baseUrlConfig.BASEURL + pathToadd;
        }

        if (values.purityTestImages) {
            for (image of values.purityTestImages) {
                image.URL = baseUrlConfig.BASEURL + image.url;
                let filePath = image.url;
                let pathToadd = filePath.replace('public/', '');
                image.URL = baseUrlConfig.BASEURL + pathToadd;
            }
        }

        return values;
    }


    // FUNCTION TO ADD CUSTOMER ORNAMENTS DETAIL
    customerLoanOrnamentsDetail.addCustomerOrnamentsDetail =
        (loanId, ornamentData, createdBy, modifiedBy, t) => {
            let finalOrnamentData = ornamentData.map(function (ele) {
                let obj = Object.assign({}, ele);
                obj.isActive = true;
                obj.loanId = loanId;
                obj.createdBy = createdBy;
                obj.modifiedBy = modifiedBy;
                return obj;
            })
            return customerLoanOrnamentsDetail.bulkCreate(finalOrnamentData, { t });
        };

    // FUNCTION TO UPDATE CUSTOMER ORNAMENTS DETAIL
    customerLoanOrnamentsDetail.editCustomerOrnamentsDetail =
        (id, ornamentType, quantity, grossWeight, netWeight, deductionWeight, weightMachineZeroWeight, withOrnamentWeight,
            stoneTouch, acidTest, purityTest, ornamentImage, ltvPercent, ltvAmount, currentLtvAmount) => customerLoanOrnamentsDetail.update({
                ornamentType, quantity, grossWeight, netWeight, deductionWeight, weightMachineZeroWeight,
                withOrnamentWeight, stoneTouch, acidTest, purityTest, ornamentImage, ltvPercent, ltvAmount, currentLtvAmount
            }, { where: { id, isActive: true } });

    return customerLoanOrnamentsDetail;
}