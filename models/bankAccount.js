const mongoose = require('mongoose');

const bankAccountSchema = mongoose.Schema({
    ownerid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropOwner',
        required: true
    },
    name: {
        type: String,
        required: true,
        maxLength: 40
    },
    accno: {
        type: Number,
        maxLength: 10,
        required: true
    },
    ifsc: {
        type: String,
        maxLength: 11,
        required: true
    }
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;