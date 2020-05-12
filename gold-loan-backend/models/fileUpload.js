const BaseUrl = require('../config/baseUrl').BASEURL;


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
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_file_upload',
    });


    // This will return required JSON.

    FileUpload.prototype.toJSON = function() {
        var values = Object.assign({}, this.get());
        values.URL = BaseUrl + '/uploads/images/' + values.filename
        values.path = `public/uploads/images/${values.filename}`;
        delete values.encoding;
        return values;
    }

    return FileUpload;
}