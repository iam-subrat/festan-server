const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    propId: {
        type: String,
        ref: 'EventProp',
        required: true
    },
    eventDate: {
        type: String,
        required: true
    },
    eventTime: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    bookingDate: {
        type: String,
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    }
});

const EventDetails = mongoose.model('EventDetails', EventSchema);

module.exports = EventDetails;
