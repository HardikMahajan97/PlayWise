import express from 'express';
const app = express();
import Court from '../models/Court.model.js';
import BadmintonHall from '../models/BadmintonHall.model.js';
import CourtAvailability from '../models/CourtAvailability.model.js';
import VendorInfo from '../models/vendorAuth.model.js';
import sendEmail from "../utils/SendEmail.js";
import generateCourtEmail from "../utils/generateCourtEmails.js";

async function sendMailToVendor(vendorId, court, actionType, extraDetails = {}) {
    const vendor = await VendorInfo.findById(vendorId);
    const emailContent = generateCourtEmail(actionType, court.number, extraDetails);
    await sendEmail(vendor.email, `🏸 Court Update: ${court.number}`, emailContent);
}
export const createCourt = async (req, res) => {
    try {
        const {hallId, vendorId} = req.params;
        console.log(req.params);

        const {number} = req.body;

        console.log("Creating court for hallId:", hallId);
        console.log("Received data:", {number});
        if (!hallId || !number || !vendorId) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const hall = await BadmintonHall.findById(hallId);
        if (!hall) {
            return res.status(404).json({ success: false, message: "Badminton hall not found" });
        }
        const existingCourt = await Court.findOne({ hallId: hallId, number: number });
        if(existingCourt) return res.status(400).json({ success: false, message: "Court with this number already exists in this hall" });
        const courtsInHall = await Court.find({ hallId: hallId }).countDocuments();
        if(courtsInHall > hall.numberOfCourts) {
            return res.status(400).json({ success: false, message: `This hall can only have ${hall.numberOfCourts} courts` });
        }

        const newCourt = new Court({
            hallId: hallId,
            number: number
        });
        await newCourt.save();

        await sendMailToVendor(
            vendorId,
            newCourt,
            "create"
        );
        return res.status(201).json({ success: true, data: newCourt });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error, could not add court!", error: error.message });
    } finally {
        console.log("Court creation attempted");
    }
}

export const updateCourt = async (req, res) => {
    try {
        const court = await Court.findById(req.params.courtId);
        const vendorId = req.params.vendorId;
        if (!court || !vendorId) return res.status(404).json({ error: "Court not found or vendor Id was missing" });
        Object.assign(court, req.body);
        await court.save();
        await sendMailToVendor(
            vendorId,
            court,
            "update",
            { updatedFields: req.body }
        );
        res.json({ message: "Court updated", data: court });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error, could not update court!" });
    }
};

export const deleteCourt = async (req, res) => {
    try {
        const court = await Court.findById(req.params.courtId);
        if (!court) return res.status(404).json({ error: "Court not found" });
        const vendorId = req.params.vendorId;
        if(!vendorId) return res.status(400).json({ error: "Vendor ID is required" });
        await Court.findByIdAndDelete(req.params.courtId);

        await sendMailToVendor(
            vendorId,
            court,
            "delete"
        );
        res.json({ message: "Court deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error, could not delete court!" });
    }
};

export const getCourtById = async (req, res) => {
    try {
        const court = await Court.findById(req.params.courtId);
        if (!court) return res.status(404).json({ error: "Court not found" });
        const vendor = await VendorInfo.findById(req.params.vendorId);
        if(!vendor) return res.status(404).json({ error: "Vendor not found" });
        const hall = await BadmintonHall.findById(court.hallId);

        res.json({ success: true, data: { court, vendor, hall} });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error, could not fetch court!" });
    }
};
export const getAllCourts = async (req, res) => {
    try {
        const courts = await Court.find({ hallId: req.params.hallId }, {multi:true});
        if (!courts || courts.length === 0) {
            return res.status(404).json({ success: false, message: "No courts found for this hall" });
        }
        return res.status(200).json({success: true, data: courts});
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error, could not fetch courts!", error: err.message });
    }
}

export const setAvailability = async (req, res) => {
    try {
        const { dayOfWeek, slots } = req.body;
        const { courtId, vendorId } = req.params;
        if (!dayOfWeek || !slots || !courtId || !vendorId) {
            return res.status(400).json({ error: "Day of week, slots, vendor ID and court ID are required" });
        }

        const exists = await CourtAvailability.findOne({ courtId, dayOfWeek });
        if (exists) return res.status(400).json({ error: "Already set for this day" });

        const availability = new CourtAvailability({ courtId, dayOfWeek, slots });
        await availability.save();

        const court = await Court.findById(courtId);

        await sendMailToVendor(
            vendorId,
            court,
            "availability_set",
            { dayOfWeek, slots }
        );
        res.status(201).json({ message: "Availability set", availability });
    } catch (err) {
        return res.status(500).json({success:false, message: "Internal Server Error, could not set availability!", error: err.message});
    }
};

export const updateAvailability = async (req, res) => {
    try {
        const availability = await CourtAvailability.findOneAndUpdate(
            { courtId: req.params.courtId, dayOfWeek: req.body.dayOfWeek },
            { slots: req.body.slots },
        );
        if (!availability) return res.status(404).json({ error: "Availability not found" });
        const vendorId = req.params.vendorId;
        const court = await Court.findById(courtId);

        await sendMailToVendor(
            vendorId,
            court,
            "availability_update",
            { dayOfWeek, slots: req.body.slots }
        );
        res.json({ message: "Availability updated", availability });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error, could not update availability!", error: err.message });
    }
};