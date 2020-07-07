const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const customerLoanDocument = sequelize.define('customerLoanDocument', {
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
        loanAgreementCopy: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'loan_agreement_copy'
        },
        pawnCopy: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'pawn_copy'
        },
        schemeConfirmationCopy: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'scheme_confirmation_copy'
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
        tableName: 'customer_loan_document',
    });


    customerLoanDocument.associate = function (models) {
        customerLoanDocument.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
        customerLoanDocument.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        customerLoanDocument.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoanDocument.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    customerLoanDocument.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        let loanAgreementCopyImage = []
        let pawnCopyImage = []
        let schemeConfirmationCopyImage = []

        if (values.loanAgreementCopy) {
            for (imgUrl of values.loanAgreementCopy) {
                let URL = baseUrlConfig.BASEURL + imgUrl;
                loanAgreementCopyImage.push(URL)
            }
        }
        if (values.pawnCopy) {
            for (imgUrl of values.pawnCopyImage) {
                let URL = baseUrlConfig.BASEURL + imgUrl;
                pawnCopyImage.push(URL)
            }
        }
        if (values.schemeConfirmationCopy) {
            for (imgUrl of values.schemeConfirmationCopyImage) {
                let URL = baseUrlConfig.BASEURL + imgUrl;
                schemeConfirmationCopyImage.push(URL)
            }
        }
        values.loanAgreementCopyImage = loanAgreementCopyImage
        values.pawnCopyImage = pawnCopyImage
        values.schemeConfirmationCopyImage = schemeConfirmationCopyImage


        return values;
    }


    return customerLoanDocument;
}