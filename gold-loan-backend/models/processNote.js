
module.exports = (sequelize, DataTypes) => {
    const ProcessNote = sequelize.define('processNote', {
        // attributes
        pdf: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'pdf'

        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_process_note',
    });

    ProcessNote.associate = function (models) {
    }

    ProcessNote.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        let ProcessNotePdf = []
        if (values.pdf) {
            for (imgUrl of values.pdf) {
                let URL = process.env.BASE_URL + imgUrl;
                ProcessNotePdf.push(URL)
            }
        }
        values.ProcessNotePdf = ProcessNotePdf
        return values;
    }

    //Add_Banner
    ProcessNote.addProcessNote = (pdf, userId) => ProcessNote.create({ pdf, userId });

    //Update_ProcessNote
    ProcessNote.updateProcessNote = (id, pdf, userId) => ProcessNote.update({ pdf, userId }, { where: { id } })

    //Read_ProcessNote
    ProcessNote.readProcessNote = () => ProcessNote.findAll();


    return ProcessNote;
}