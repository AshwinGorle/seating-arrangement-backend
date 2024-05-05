import mongoose from 'mongoose';

const lokerSchema = new mongoose.Schema({
    lockerNumber: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        default : 0,
        required: true
    },
    size: {
        type: String,
        enum: ['S', 'M', 'L'],
        default: 'M'
    },
    location: {
        type: String,
        
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    organization : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Organization',
        require : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    occupant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        default: null
    },
    validity :  {type : Date, default : null},
    

},{timestamps : true});

lokerSchema.index({organization : 1, lokerNumber : 1}, {unique : true});

const LokerModel = mongoose.model('Locker', lokerSchema);

export default LokerModel;