const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    url: String,
    filename: String
});

const LocationSchema = mongoose.Schema({
    longitude: Number,
    latitude: Number,
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    }
});

LocationSchema.virtual('lngLat').get(function() {
    return [this.longitude, this.latitude];
})

const eventPropSchema = mongoose.Schema({
    name: String,
    size: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    allowBooking: {
        type: String,
        default: 'true'
    },
    officeHours: String,
    service: Array,
    cctv: {
        type: Boolean,
        default: false
    },
    dressingRoom: {
        type: Number,
        default: 0
    },
    functiontype: Array,
    description: String,
    images: [ImageSchema],
    contact: {
        type: Number,
        required: true
    },
    mailid: String,
    location: LocationSchema,
    ownerid: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropOwner',
        required: true
    }
});

const EventProp = mongoose.model('EventProp', eventPropSchema);

module.exports = EventProp;