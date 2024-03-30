import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    recipients: {
        type: [String], // Assuming email addresses are stored as strings
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const EmailModel = mongoose.model('Email', emailSchema);

export default EmailModel;
