import mongoose from 'mongoose';
import { morningStartTime, morningEndTime, noonStartTime, noonEndTime, eveningStartTime, eveningEndTime } from '../constant.js';


const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: Number,
        required: true,
    },
    organization : {type : mongoose.Schema.Types.ObjectId , ref : "Organization" },
    description : {type : String},
    schedule: {
        morning: { 
            // startTime: { type: Date, default: morningStartTime },
            // endTime: { type: Date, default: morningEndTime },
            occupant: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }
        },
        noon: {
            // startTime: { type: Date, default: noonStartTime },
            // endTime: { type: Date, default: noonEndTime },
            occupant: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }
        },
        evening: {
            // startTime: { type: Date, default: eveningStartTime },
            // endTime: { type: Date, default: eveningEndTime },
            occupant: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }
        },
        fullDay: {
            // startTime: { type: Date, default: fullDayStartTime },
            // endTime: { type: Date, default: fullDayEndTime },
            occupant: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }
        }
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

seatSchema.pre('save', function(next) {
    const seat = this;

    if (seat.schedule.fullDay.occupant && (
        seat.schedule.morning.occupant ||
        seat.schedule.noon.occupant ||
        seat.schedule.evening.occupant
    )) {
        return next(new Error('Seat cannot be occupied for full day and specific time slots simultaneously'));
    }

    if ((seat.schedule.morning.occupant || seat.schedule.noon.occupant || seat.schedule.evening.occupant) && seat.schedule.fullDay.occupant) {
        return next(new Error('Seat cannot be occupied for specific time slots and full day simultaneously'));
    }

    return next();
});

seatSchema.index({ seatNumber : 1, organization: 1 }, { unique: true });
const SeatModel = mongoose.model('Seat', seatSchema);

export default SeatModel;
