module.exports = (sequelize, DataTypes) => {
    const PartRelease = sequelize.define('partRelease', {
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        payableAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'payable_amount',
        },
        customerLoanTransactionId:{
            type: DataTypes.INTEGER,
            field: 'customer_loan_transaction_id',
        },
        paidAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'paid_amount',
        },
        releaseAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'release_amount',
        },
        interestAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'interest_amount',
        },
        penalInterest:{
            type: DataTypes.DECIMAL(10,2),
            field: 'penal_interest',
        },
        amountStatus:{
            type: DataTypes.ENUM,
            field: 'amount_status',
            values: ['pending', 'completed', 'rejected'],
            defaultValue: 'pending'
        },
        partReleaseStatus:{
            type: DataTypes.ENUM,
            field: 'part_release_status',
            values: ['pending', 'released'],
            defaultValue: 'pending'
        },
        appraiserReason:{
            type: DataTypes.TEXT,
            field: 'appraiser_reason',
        },
        documents:{
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'documents'
        },
        currentOutstandingAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'current_outstanding_amount',
        },
        releaseGrossWeight:{
            type: DataTypes.FLOAT,
            field: 'release_gross_weight',
        },
        releaseDeductionWeight:{
            type: DataTypes.FLOAT,
            field: 'release_deduction_weight',
        },
        releaseNetWeight:{
            type: DataTypes.FLOAT,
            field: 'release_net_weight',
        },
        remainingGrossWeight:{
            type: DataTypes.FLOAT,
            field: 'remaining_gross_weight',
        },
        remainingDeductionWeight:{
            type: DataTypes.FLOAT,
            field: 'remaining_deduction_weight',
        },
        remainingNetWeight:{
            type: DataTypes.FLOAT,
            field: 'remaining_net_weight',
        },
        remainingOrnamentAmount:{
            type: DataTypes.FLOAT,
            field: 'remaining_ornament_amount',
        },
        newLoanAmount:{
            type: DataTypes.FLOAT,
            field: 'new_loan_amount',
        },
        currentLtv:{
            type: DataTypes.FLOAT,
            field: 'current_ltv',
        },
        isLoanCreated:{
            type: DataTypes.BOOLEAN,
            field: 'is_loan_created',
            defaultValue: false
        },
        newLoanId:{
            type: DataTypes.INTEGER,
            field: 'new_loan_id',
        },
        releaseDate:{
            type: DataTypes.DATE,
            field: 'release_date',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isAppraiserAssigned:{
            type: DataTypes.BOOLEAN,
            field: 'is_appraiser_assigned',
            defaultValue: false
        },
        isActive:{
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'loan_part_release',
    });


    PartRelease.associate = function(models) {
        PartRelease.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        PartRelease.belongsTo(models.customerLoanMaster, { foreignKey: 'newLoanId', as: 'newLoan' });
        PartRelease.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        PartRelease.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        PartRelease.belongsToMany(models.customerLoanOrnamentsDetail,{through: models.partReleaseOrnaments,foreignKey: 'partReleaseId'});
        PartRelease.hasOne(models.partReleaseAppraiser, { foreignKey: 'partReleaseId', as: 'appraiserData', });
        PartRelease.belongsTo(models.customerLoanTransaction, { foreignKey: 'customerLoanTransactionId', as: 'transaction' });
    }

    PartRelease.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
               //orna
               var resOrna = []
               if (values.customerLoanOrnamentsDetails) {
                   for (let i = 0; i < values.customerLoanOrnamentsDetails.length; i++) {
                       if (values.customerLoanOrnamentsDetails[i].weightMachineZeroWeight) {
       
                           let data = {};
                           data.path = values.customerLoanOrnamentsDetails[i].weightMachineZeroWeight;
                           data.URL = process.env.BASE_URL + values.customerLoanOrnamentsDetails[i].weightMachineZeroWeight;
                           values.customerLoanOrnamentsDetails[i].weightMachineZeroWeightData = data;
       
                       }
       
                       if (values.customerLoanOrnamentsDetails[i].withOrnamentWeight) {
       
                           let data = {};
                           data.path = values.customerLoanOrnamentsDetails[i].withOrnamentWeight;
                           data.URL = process.env.BASE_URL + values.customerLoanOrnamentsDetails[i].withOrnamentWeight;
                           values.customerLoanOrnamentsDetails[i].withOrnamentWeightData = data;
                       }
       
                       if (values.customerLoanOrnamentsDetails[i].stoneTouch) {
       
                           let data = {};
                           data.path = values.customerLoanOrnamentsDetails[i].stoneTouch;
                           data.URL = process.env.BASE_URL + values.customerLoanOrnamentsDetails[i].stoneTouch;
                           values.customerLoanOrnamentsDetails[i].stoneTouchData = data;
                       }
       
                       if (values.customerLoanOrnamentsDetails[i].acidTest) {
                           // values.customerLoanOrnamentsDetails[i].acidTestData = process.env.BASE_URL + values.customerLoanOrnamentsDetails[i].acidTest;
       
                           let data = {};
                           data.path = values.customerLoanOrnamentsDetails[i].acidTest;
                           data.URL = process.env.BASE_URL + values.customerLoanOrnamentsDetails[i].acidTest;
                           values.customerLoanOrnamentsDetails[i].acidTestData = data;
                       }
       
                       if (values.customerLoanOrnamentsDetails[i].ornamentImage) {
                           let data = {};
                           data.path = values.customerLoanOrnamentsDetails[i].ornamentImage;
                           data.URL = process.env.BASE_URL + values.customerLoanOrnamentsDetails[i].ornamentImage;
                           values.customerLoanOrnamentsDetails[i].ornamentImageData = data;
                       }
                       if (values.customerLoanOrnamentsDetails[i].purityTest) {
                           for (image of values.customerLoanOrnamentsDetails[i].purityTest) {
                               image.purityTest = process.env.BASE_URL + image.purityTest;
                           }
       
                       }
                       let purityTestImage = []
                       let purityTestPath = []
                       let newData;
       
                       if (values.customerLoanOrnamentsDetails[i].purityTest.length) {
       
                           for (imgUrl of values.customerLoanOrnamentsDetails[i].purityTest) {
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
                       values.customerLoanOrnamentsDetails[i].purityTestImage = newData
       
                       resOrna.push(values.customerLoanOrnamentsDetails[i])
                   }
               }

               if (values.documents) {
                    let documentsImages = [];
                    for (image of values.documents) {
                        let URL = process.env.BASE_URL + image;
                        documentsImages.push(URL)
                    }
                    values.documentsImages = documentsImages;
            }
               return values
            }

    return PartRelease;
}