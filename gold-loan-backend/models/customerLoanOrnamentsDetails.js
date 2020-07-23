module.exports = (sequelize, DataTypes) => {
    const customerLoanOrnamentsDetail = sequelize.define('customerLoanOrnamentsDetail', {
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
        ornamentTypeId: {
            type: DataTypes.INTEGER,
            field: 'ornament_type_id'
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
            type: DataTypes.TEXT,
            field: 'weight_machine_zero_weight'
        },
        withOrnamentWeight: {
            type: DataTypes.TEXT,
            field: 'with_ornament_weight'
        },
        stoneTouch: {
            type: DataTypes.TEXT,
            field: 'stone_touch'
        },
        acidTest: {
            type: DataTypes.TEXT,
            field: 'acid_test'
        },
        purityTest: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'purity_test'
        },
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
            type: DataTypes.TEXT,
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
        ornamentFullAmount:{
            type: DataTypes.STRING,
            field: 'ornament_full_amount'
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
        isReleased: {
            type: DataTypes.BOOLEAN,
            field: 'is_released',
            defaultValue: false
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
        customerLoanOrnamentsDetail.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        customerLoanOrnamentsDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoanOrnamentsDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        customerLoanOrnamentsDetail.belongsTo(models.ornamentType, { foreignKey: 'ornamentTypeId', as: 'ornamentType' });

    }

    customerLoanOrnamentsDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.weightMachineZeroWeight) {
            values.weightMachineZeroWeightData = process.env.BASE_URL + values.weightMachineZeroWeight;
        }
        if (values.withOrnamentWeight) {
            values.withOrnamentWeightData = process.env.BASE_URL + values.withOrnamentWeight;
        }
        if (values.stoneTouch) {
            values.stoneTouchData = process.env.BASE_URL + values.stoneTouch;
        }
        if (values.acidTest) {
            values.acidTestData = process.env.BASE_URL + values.acidTest;
        }
        if (values.ornamentImage) {
            values.ornamentImageData = process.env.BASE_URL + values.ornamentImage;
        }
        let purityTestImage = []
        if (values.purityTest) {
            for (imgUrl of values.purityTest) {
                let URL = process.env.BASE_URL + imgUrl;
                purityTestImage.push(URL)
            }
        }
        values.purityTestImage = purityTestImage

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