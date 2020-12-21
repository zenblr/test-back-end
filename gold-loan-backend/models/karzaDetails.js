module.exports = (sequelize, DataTypes) => {
    const KarzaDetails = sequelize.define('karzaDetails', {
        // attributes
        panUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'panUrl'
        },
        panVerifyUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'pan_verify_url',
        },
        nameUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name_url',
        },
        kycOcrUrl: {
            type: DataTypes.STRING,
            field: 'kyc_ocr_url',
        },
        formOcrUrl: {
            type: DataTypes.STRING,
            field: 'form_ocr_url',
        },
        dlAuthenticationUrl: {
            type: DataTypes.STRING,
            field: 'dl_authentication_url',
        },
        voterIdAuthenticationUrl: {
            type: DataTypes.STRING,
            field: 'voter_id_authentication_url',
        },
        passportVerificationUrl: {
            type: DataTypes.STRING,
            field: 'passport_verification_url',
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'key',
        },
        consent: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'consent',
        },
        type: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'type',
        },
        preset: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'preset',
        },
        env: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'env'
        },
        confidenceVal1: {
            type: DataTypes.FLOAT,
            field: 'confidence_val1'
        },
        confidenceVal2: {
            type: DataTypes.FLOAT,
            field: 'confidence_val2',
        },
        nameConfidence: {
            type: DataTypes.FLOAT,
            field: 'name_confidence',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'isActive',
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'karza_detail'
    });

    return KarzaDetails;
}