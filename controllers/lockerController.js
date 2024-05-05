import LockerModel from '../models/LockerModel.js'
import mongoose from "mongoose";
import getRequiredOrganizationId from "../utils/getRequiredOrganizationId.js";
import OrganizationModel from "../models/OrganizationModel.js";
import authorizeActionInOrganization from "../utils/authorizeActionInOrganization.js";
import UserModel from "../models/UserModel.js";
import MemberModel from "../models/MemberModel.js";

class LockerController {
    static createLocker = async (req, res) => {
        try {
            const { lockerNumber, price, size, location } = req.body;
            // Check if all required fields are present
            if (!lockerNumber || !price || !size) {
                throw new Error("All fields are required");
            }

            //fetching required organization Id
            const organizationId = getRequiredOrganizationId(
                req,
                "admin requires organization Id to create locker"
            );
            const organization = await OrganizationModel.findById(organizationId);
            if (!organization) throw new Error("Organization not found!");

            // Create the locker
            const locker = await LockerModel.create({
                lockerNumber,
                price,
                size,
                location,
                organization: organizationId,
            });

            res.status(201).send({
                status: "success",
                message: "Locker created successfully",
                data: locker,
            });
        } catch (err) {
            console.error("Error creating locker:", err.message);
            if (err.code === 11000) {
                if (
                    (err.keyPattern && err.keyPattern.organization) ||
                    err.keyPattern.lockerNumber
                ) {
                    // Both organization and locker Number are duplicated
                    return res.status(409).send({
                        status: "failed",
                        message: "Locker with the same Number already exists!",
                    });
                }
                res.status(400).send({
                    status: "failed",
                    message: err.message,
                });
            }
        }
    };

    static getAllLockers = async (req, res) => {
        try {
            const organizationId = getRequiredOrganizationId(req, "Admin requires Organization Id to get all locker");
            const organization = await OrganizationModel.findById(organizationId);
            if (!organization) throw new Error("Organization not found");
            const lockers = await LockerModel.find({ organization: organizationId }).populate('occupant');
            res.status(200).send({
                status: "success",
                message: "All Lockers fetched successfully!",
                data: lockers,
            });

        } catch (err) {
            console.log("All locker fetching error : ", err)
            res.status(500).send({
                status: "failed",
                message: err.message,
            });
        }
    }

    static updateLocker = async (req, res) => {
        try {
            const { lockerId } = req.params;
            const { price, size, location } = req.body;

            // Check if lockerId is provided
            if (!lockerId) {
                throw new Error('Locker ID is required');
            }

            // Find the locker by ID
            const locker = await LockerModel.findById(lockerId);
            if (!locker) {
                throw new Error('Locker not found');
            }

            //authorized action in organization
            authorizeActionInOrganization(req.user, locker._id, "You are not authorized to update locker in this Org.");

            // Update the locker fields
            if (price) {
                locker.price = price;
            }
            if (size) {
                locker.size = size;
            }
            if (location) {
                locker.location = location;
            }

            // Save the updated locker
            const updatedLocker = await locker.save();

            res.status(200).send({
                status: 'success',
                message: 'Locker updated successfully',
                data: updatedLocker
            });
        } catch (err) {
            console.error('Error updating locker:', err.message);
            res.status(400).send({
                status: 'failed',
                message: err.message
            });
        }
    };

    static deleteLocker = async (req, res) => {
        try {
            const { lockerId } = req.params;

            // Check if lockerId is provided
            if (!lockerId) {
                throw new Error('Locker ID is required');
            }

            // Find the locker by ID
            const locker = await LockerModel.findById(lockerId);
            if (!locker) {
                throw new Error('Locker not found');
            }

            //authorized action in organization
            authorizeActionInOrganization(req.user, locker.organization, "You are not authorized to delete this locker in this Org.");

            // Delete the locker
            await locker.remove();

            res.status(200).send({
                status: 'success',
                message: 'Locker deleted successfully',
                data: locker
            });
        } catch (err) {
            console.error('Error deleting locker:', err.message);
            res.status(400).send({
                status: 'failed',
                message: err.message
            });
        }
    };

    static allocateLockerToMember = async (req, res) => {
        const session = await mongoose.startSession();
        await session.startTransaction();
        try {
            const { memberId, lockerId } = req.body;

            // Check if memberId and lockerId are provided
            if (!memberId || !lockerId) {
                throw new Error('Member ID and Locker ID are required');
            }

            // Find the member and locker by their IDs
            const member = await MemberModel.findById(memberId);
            const locker = await LockerModel.findById(lockerId);

            // Check if member and locker exist
            if (!member) {
                throw new Error('Member not found');
            }
            if (!locker) {
                throw new Error('Locker not found');
            }

            // authorized anction in organization
            authorizeActionInOrganization(req.user, member.organization, 'You are not authorized to allocate the locker to this member');
            authorizeActionInOrganization(req.user, locker.organization, 'You are not authorized to allocate this locker to the member');

            // Check if the locker is already allocated
            if (locker?.occupant) {
                const lockerOccupant = await MemberModel.findById(locker.occupant);
                if (!lockerOccupant) throw new Error('member id is present in occupant but the member does not exists')
                throw new Error(`Locker is already allocated to another member (${lockerOccupant.name})`);
            }

            // Assign the locker to the member
            locker.occupant = memberId;
            await locker.save({ session });

            // Update the member's record to include the allocated locker
            member.lockers.push(lockerId);
            await member.save({ session });

            //commiting the cahnges in database
            await session.commitTransaction();
            session.endSession();

            // Send success response
            res.status(200).send({
                status: 'success',
                message: 'Locker allocated to member successfully',
                data: {
                    member: member,
                    locker: locker
                }
            });
        } catch (err) {
            await session.abortTransaction();
            await session.endSession();
            console.error('Error allocating locker to member:', err.message);
            res.status(400).send({
                status: 'failed',
                message: err.message
            });
        }
    };
    static deallocateLockerById = async (req, res) => {
        const session = await mongoose.startSession();
        await session.startTransaction();
        try {
            const { lockerId } = req.params;

            // Check if lockerId is provided
            if (!lockerId) {
                throw new Error('Locker ID is required');
            }

            // Find the locker by ID
            const locker = await LockerModel.findById(lockerId);

            // Check if locker exists
            if (!locker) {
                throw new Error('Locker not found');
            }

            // authorized action in organization
            authorizeActionInOrganization(req.user, locker.organization, 'You are not authorized to deallocate this locker');

            // Check if the locker is currently allocated
            if (!locker.occupant) {
                throw new Error('Locker is not currently allocated');
            }

            // Find the member to update their record
            const member = await MemberModel.findById(locker.occupant);

            if (!member) {
                throw new Error('Member not found');
            }

            // Remove the locker ID from the member's record
            if (member) {
                member.lockers = member.lockers.filter(id => id.toString() !== lockerId);
                await member.save({ session });
            }

            // Deallocate the locker
            locker.occupant = null;
            await locker.save({ session });


            await session.commitTransaction();
            session.endSession();

            res.status(200).send({
                status: 'success',
                message: 'Locker deallocated successfully',
                data: locker
            });
        } catch (err) {
            await session.abortTransaction();
            await session.endSession();
            console.error('Error deallocating locker:', err.message);
            res.status(400).send({
                status: 'failed',
                message: err.message
            });
        }
    };
}

export default LockerController;
