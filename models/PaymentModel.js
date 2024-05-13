import mongoose from 'mongoose';
const paymentTimelineSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const paymentSchema = new mongoose.Schema({
    
    status : {
        type : String,
        enum : ['pending', 'completed'],
        default : 'pending'
    },
    service : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Service',
        required : true
    },
    serviceType : {
       type : String ,
       enum : ["SeatService", "LockerService"]
    },
    validity : {
        type : Date,
        required : true
    },
    amount: {
        type: Number,
        required: true
    },
    nature : {
        type  : String,
        enum : ['real', 'adjustment'],
        default : 'real'
    },
    method: {
        type: String,
        enum: ["cash", 'online'], // Add more methods as needed
        default : "cash"
    },

    desciption : {
        type : String,
    },

    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt :{
        type: Date,
        default: Date.now
    },

    organization : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Organization',
        required : true
    },
    timeline: [paymentTimelineSchema] // Timeline to store actions and timestamps
}, {discriminatorKey : 'serviceType'});

const seatServicePayment  = new mongoose.Schema({
    seat : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Seat'
    }
})

const lockerServicePayment  = new mongoose.Schema({
    locker : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Locker'
    }
})

const PaymentModel = mongoose.model('Payment', paymentSchema);
PaymentModel.discriminator('SeatPayment', seatServicePayment);
PaymentModel.discriminator('LockerPayment', lockerServicePayment);
export default PaymentModel;
