import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    type : {
        type  : String,
        enum : ['real', 'adjustment']
    },
    method: {
        type: String,
        enum: ["cash", 'online'], // Add more methods as needed
        required: true
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
    }
});

const PaymentModel = mongoose.model('Payment', paymentSchema);

export default PaymentModel;
