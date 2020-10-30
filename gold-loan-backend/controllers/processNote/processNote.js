const models = require('../../models'); // importing models.



// Add & Update ProcessNote
exports.addUpdateProcessNote = async (req, res, next) => {
    const { pdf } = req.body;
    let userId = req.userData.id
    let ProcessNote = await models.ProcessNote.readProcessNote()
    if (ProcessNote.length == 0) {

        let CreatedProcessNote = await models.ProcessNote.addProcessNote(pdf, userId);

        if (!CreatedProcessNote) {
            res.status(422).json({ message: 'Process note not added' });
        } else {
            res.status(201).json(CreatedProcessNote)
        }
    } else {
        let id = ProcessNote[0].id;
        let UpdateData = await models.ProcessNote.updateProcessNote(id, pdf, userId)

        if (UpdateData[0] === 0) {
            return res.status(404).json({ message: 'Data not updated' });
        }
        return res.status(200).json({ message: 'Success' });

    }
}

// Read ProcessNote.

exports.readProcessNote = async (req, res, next) => {
    let ProcessNote = await models.ProcessNote.findAll({})

    if (!ProcessNote) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json({ data: ProcessNote[0] });
    }

};

// //Delete ProcessNote.

// exports.deleteProcessNote = async (req, res, next) => {
//     let ProcessNoteId = req.params.id;

//     let ProcessNoteData = await models.ProcessNote.findOne({ where: { id: ProcessNoteId } });
//     if (!ProcessNoteData[0]) {
//         return res.status(404).json({ message: ' data not found' })
//     }
//     let deletedata = await models.ProcessNote.destroy({ where: { id: ProcessNoteId } });
//     res.status(200).json({ message: 'Success' });
// }