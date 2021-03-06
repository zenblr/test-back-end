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
        remark: {
            type: DataTypes.STRING,
            field: 'remark'
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
        evaluation:{
            type: DataTypes.FLOAT,
            field: 'evaluation'
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
            type: DataTypes.DECIMAL(10,2),
            field: 'loan_amount'
        },
        ornamentFullAmount:{
            type: DataTypes.DECIMAL(10,2),
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
        customerLoanOrnamentsDetail.belongsToMany(models.partRelease, { through: models.partReleaseOrnaments, foreignKey: 'ornamentId' });

        customerLoanOrnamentsDetail.belongsToMany(models.packet, { through: models.packetOrnament, foreignKey: 'ornamentDetailId' });

    }

    customerLoanOrnamentsDetail.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.weightMachineZeroWeight) {

            let data = {};
            data.path = values.weightMachineZeroWeight;
            data.URL = process.env.BASE_URL + values.weightMachineZeroWeight;
            values.weightMachineZeroWeightData = data;

        }
        if (values.withOrnamentWeight) {

            let data = {};
            data.path = values.withOrnamentWeight;
            data.URL = process.env.BASE_URL + values.withOrnamentWeight;
            values.withOrnamentWeightData = data;
        }

        if (values.stoneTouch) {

            let data = {};
            data.path = values.stoneTouch;
            data.URL = process.env.BASE_URL + values.stoneTouch;
            values.stoneTouchData = data;
        }
        if (values.acidTest) {
            // values.acidTestData = process.env.BASE_URL + values.acidTest;

            let data = {};
            data.path = values.acidTest;
            data.URL = process.env.BASE_URL + values.acidTest;
            values.acidTestData = data;
        }

        if (values.ornamentImage) {
            let data = {};
            data.path = values.ornamentImage;
            data.URL = process.env.BASE_URL + values.ornamentImage;
            values.ornamentImageData = data;
        }
        let purityTestImage = []
        let purityTestPath = []
        let newData = {}

        if (values.purityTest) {

            for (imgUrl of values.purityTest) {
                let URL = process.env.BASE_URL + imgUrl;
                purityTestImage.push(URL)

                let path = imgUrl;
                purityTestPath.push(path)

                let data = {};
                data.path = purityTestPath;
                data.URL = purityTestImage;
                newData = data;
            }
        }
        values.purityTestImage = newData
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