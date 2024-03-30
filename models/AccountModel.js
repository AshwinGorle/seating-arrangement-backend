import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    balance: {
        type: Number,
        default: 0
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
     accountHolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    }
}, { timestamps: true });

const AccountModel = mongoose.model('Account', accountSchema);

export default AccountModel;
