import mongoose from 'mongoose';

const lockerSchema = new mongoose.Schema({
    lockerNumber: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        enum: ['S', 'M', 'L'],
        default: 'M'
    },
    location: {
        type: String
    },
    occupant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        default: null
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
},{timestamps : true});

lockerSchema.index({ organization: 1, lockerNumber: 1 }, { unique: true });

const LockerModel = mongoose.model('Locker', lockerSchema);

export default LockerModel;