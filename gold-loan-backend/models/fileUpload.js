module.exports = (sequelize, DataTypes) => {
    const FileUpload = sequelize.define('fileUpload', {
        // attributes
        filename: {
            type: DataTypes.TEXT,
            field: 'file_name'

        },
        mimetype: {
            type: DataTypes.TEXT,
            field: 'mime_type'

        },
        encoding: {
            type: DataTypes.TEXT,
            field: 'encoding'

        },
        originalname: {
            type: DataTypes.TEXT,
            field: 'original_name'

        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        },
        url:{
            type: DataTypes.TEXT,
            field:'url'
        },
        path:{
            type: DataTypes.TEXT,
            field:'path'
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_file_upload',
    });

    FileUpload.prototype.toJSON = function () {
        var values = Object.assign({}, this.get());
        values.URL = process.env.BASE_URL + values.path;
        delete values.encoding;
        return values;
    }


    return FileUpload;
}