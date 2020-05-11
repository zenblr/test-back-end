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
            type: DataTypes.STRING,
            field: 'weight_machine_zero_weight'
        },
        withOrnamentWeight: {
            type: DataTypes.STRING,
            field: 'with_ornament_weight'
        },
        stoneTouch: {
            type: DataTypes.STRING,
            field: 'stone_touch'
        },
        acidTest: {
            type: DataTypes.STRING,
            field: 'acid_test'
        },
        purityTest: {
            type: DataTypes.ARRAY(DataTypes.STRING),
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
            type: DataTypes.STRING,
            field: 'ornament_image'
        },
        ltvPercent: {
            type: DataTypes.STRING,
            field: 'ltv_percent'
        },
        ltvAmount: {
            type: DataTypes.BIGINT,
            field: 'ltv_amount'
        },
        currentLtvAmount: {
            type: DataTypes.BIGINT,
            field: 'current_ltv_amount'
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
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_ornaments_detail',
    });


    customerLoanOrnamentsDetail.associate = function (models) {
        customerLoanOrnamentsDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
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