import mongoose from "mongoose"; import MemberModel from "../models/MemberModel.js";
import PaymentModel from "../models/PaymentModel.js";
import MemberModel from './models/MemberModel';
import SeatModel from './models/SeatModel';
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import OrganizationModel from "../models/OrganizationModel.js";

class DashboardController {

    static getPaymentsOverview = async (req, res) => {
        try {
            const organizationId = getRequiredOrganizationId(
                req,
                "Admin require organizationId to get Payments Overview"
            );

            const organization = await OrganizationModel.findById(organizationId);
            if (!organization) {
                throw new Error("To get payments overview, a valid organization Id is required");
            }

            const { period = 'month' } = req.query;

            let startDate;
            const endDate = new Date();

            if (period === 'day') {
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
            } else if (period === 'week') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay());
                startDate.setHours(0, 0, 0, 0);
            } else {
                startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
            }

            const paymentsOverview = await PaymentModel.aggregate([
                {
                    $match: {
                        organization: mongoose.Types.ObjectId(organizationId),
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        status: "$status",
                        totalAmount: { $sum: "$amount" }
                    }
                }
            ]);

            // const result = payments.reduce((acc, payment) => {
            //     if (payment.status === 'completed') {
            //         acc.totalReceived += payment.totalAmount;
            //     } else if (payment._id === 'pending') {
            //         acc.totalPending += payment.totalAmount;
            //     }
            //     return acc;
            // }, { totalReceived: 0, totalPending: 0 });

            res.status(200).send({
                status: "success",
                message: "Payments overview successfully!",
                data: paymentsOverview,
            });
        } catch (err) {
            console.error("Error fetching payment overview:", err);
            res.status(500).send({
                status: "failed",
                message: err.message,
            });
        }
    }

    static getMembersOverview = async (req, res) => {
        try {
            const organizationId = getRequiredOrganizationId(
                req,
                "Admin require organizationId to get Members Overview"
            );

            const organization = await OrganizationModel.findById(organizationId);
            if (!organization) {
                throw new Error("To get members overview, a valid organization Id is required");
            }

            const { period = 'month' } = req.query;

            let startDate;
            const endDate = new Date();

            if (period === 'day') {
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
            } else if (period === 'week') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay());
                startDate.setHours(0, 0, 0, 0);
            } else {
                startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
            }

            const memberCount = await MemberModel.countDocuments({
                organization: mongoose.Types.ObjectId(organizationId),
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const result = {
                join: memberCount,
                left: 0,
                period
            };

            res.status(200).send({
                status: "success",
                message: `Members Overview Get Successfully`,
                data: result,
            });
        } catch (err) {
            console.log("members overview error: ", err.message);
            res.status(500).send({ status: "failed", message: `${err.message}` });
        }
    }

    static getSeatsOverview = async () => {
        try {
            const organizationId = getRequiredOrganizationId(
                req,
                "Admin requires organizationId to get Seats Overview"
            );
            const organization = await OrganizationModel.findById(organizationId);
            if (!organization) {
                throw new Error("To get seats overview, a valid organization Id is required");
            }

            const { period = 'morning' } = req.query;
            if (!['morning', 'noon', 'evening', 'fullDay'].includes(period)) {
                throw new Error("Invalid period specified");
            }

            const totalSeats = await SeatModel.countDocuments({ organization: mongoose.Types.ObjectId(organizationId) });

            const bookedSeats = await SeatModel.countDocuments({
                organization: mongoose.Types.ObjectId(organizationId),
                [`schedule.${period}.occupant`]: { $ne: null }
            });

            const availableSeats = totalSeats - bookedSeats;

            const result = {
                totalSeats,
                bookedSeats,
                availableSeats
            };

            res.status(200).send({
                status: "success",
                message: `Seats Overview Get Successfully`,
                data: result
            });

        } catch (error) {
            console.log("seats overview error: ", err.message);
            res.status(500).json({ message: error.message });
        }
    }

    static getLockersOverview = () => {

    }
}

export default DashboardController;


// payments
// received this month/week/day
// pending this month/week/day

// total members
// left this month/week/day
// join this month/week/day

// total seats
// available in  /morning/noon/evening/fullDay
// booked in /morning/noon/evening/fullDay

// total locker
// available /morning/noon/evening/fullDay
// booked /morning/noon/evening/fullDay

