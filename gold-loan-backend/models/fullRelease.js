module.exports = (sequelize, DataTypes) => {
    const FullRelease = sequelize.define('fullRelease', {
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        payableAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'payable_amount',
        },
        paymentType:{
            type: DataTypes.STRING,
            field: 'payment_Type',
        },
        transactionId:{
            type: DataTypes.STRING,
            field: 'transaction_id',
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
        currentOutstandingAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'current_outstanding_amount',
        },
        depositDate:{
            type: DataTypes.DATE,
            field: 'deposit_date',
        },
        chequeNumber:{
            type: DataTypes.STRING,
            field: 'cheque_number',
        },
        bankName:{
            type: DataTypes.STRING,
            field: 'bank_name',
        },
        branchName:{
            type: DataTypes.STRING,
            field: 'branch_name',
        },
        amountStatus:{
            type: DataTypes.ENUM,
            field: 'amount_status',
            values: ['pending', 'completed', 'rejected'],
            defaultValue: 'pending'
        },
        fullReleaseStatus:{
            type: DataTypes.ENUM,
            field: 'full_release_status',
            values: ['pending', 'released'],
            defaultValue: 'pending'
        },
        releaserReason:{
            type: DataTypes.TEXT,
            field: 'releaser_reason',
        },
        documents:{
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'documents'
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
        currentLtv:{
            type: DataTypes.FLOAT,
            field: 'current_ltv',
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
        isReleaserAssigned:{
            type: DataTypes.BOOLEAN,
            field: 'is_releaser_assigned',
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
        tableName: 'loan_full_release',
    });


    FullRelease.associate = function(models) {
        FullRelease.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        FullRelease.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        FullRelease.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        FullRelease.hasOne(models.fullReleaseReleaser, { foreignKey: 'fullReleaseId', as: 'releaser', });
    }

    FullRelease.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
               //orna
               if(values.masterLoan){
               var resOrna = []
               if (values.masterLoan.loanOrnamentsDetail) {
                if (values.masterLoan.loanOrnamentsDetail[0].currentLtvAmount){
                    values.previousLtv = values.masterLoan.loanOrnamentsDetail[0].currentLtvAmount;
                }
                   for (let i = 0; i < values.masterLoan.loanOrnamentsDetail.length; i++) {
                       if (values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeight) {
       
                           let data = {};
                           data.path = values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeight;
                           data.URL = process.env.BASE_URL + values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeight;
                           values.masterLoan.loanOrnamentsDetail[i].weightMachineZeroWeightData = data;
       
                       }
       
                       if (values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeight) {
       
                           let data = {};
                           data.path = values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeight;
                           data.URL = process.env.BASE_URL + values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeight;
                           values.masterLoan.loanOrnamentsDetail[i].withOrnamentWeightData = data;
                       }
       
                       if (values.masterLoan.loanOrnamentsDetail[i].stoneTouch) {
       
                           let data = {};
                           data.path = values.masterLoan.loanOrnamentsDetail[i].stoneTouch;
                           data.URL = process.env.BASE_URL + values.masterLoan.loanOrnamentsDetail[i].stoneTouch;
                           values.masterLoan.loanOrnamentsDetail[i].stoneTouchData = data;
                       }
       
                       if (values.masterLoan.loanOrnamentsDetail[i].acidTest) {
                           // values.masterLoan.loanOrnamentsDetail[i].acidTestData = process.env.BASE_URL + values.masterLoan.loanOrnamentsDetail[i].acidTest;
       
                           let data = {};
                           data.path = values.masterLoan.loanOrnamentsDetail[i].acidTest;
                           data.URL = process.env.BASE_URL + values.masterLoan.loanOrnamentsDetail[i].acidTest;
                           values.masterLoan.loanOrnamentsDetail[i].acidTestData = data;
                       }
       
                       if (values.masterLoan.loanOrnamentsDetail[i].ornamentImage) {
                           let data = {};
                           data.path = values.masterLoan.loanOrnamentsDetail[i].ornamentImage;
                           data.URL = process.env.BASE_URL + values.masterLoan.loanOrnamentsDetail[i].ornamentImage;
                           values.masterLoan.loanOrnamentsDetail[i].ornamentImageData = data;
                       }
                       if (values.masterLoan.loanOrnamentsDetail[i].purityTest) {
                           for (image of values.masterLoan.loanOrnamentsDetail[i].purityTest) {
                               image.purityTest = process.env.BASE_URL + image.purityTest;
                           }
       
                       }
                       let purityTestImage = []
                       let purityTestPath = []
                       let newData;
       
                       if (values.masterLoan.loanOrnamentsDetail[i].purityTest.length) {
       
                           for (imgUrl of values.masterLoan.loanOrnamentsDetail[i].purityTest) {
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
                       values.masterLoan.loanOrnamentsDetail[i].purityTestImage = newData
       
                       resOrna.push(values.masterLoan.loanOrnamentsDetail[i])
                   }
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

    return FullRelease;
}