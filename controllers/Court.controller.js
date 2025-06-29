import express from 'express';
const app = express();
import Court from '../models/Court.model.js';
import BadmintonHall from '../models/BadmintonHall.model.js';
import CourtAvailability from '../models/CourtAvailability.model.js';

export const createCourt = async (req, res) => {
    try {
        const {hallId} = req.params;
        console.log(req.params);

        const {name, matType, pricePerHour} = req.body;

        console.log("Creating court for hallId:", hallId);
        console.log("Received data:", {name, matType, pricePerHour});
        if (!hallId || !name || !matType || !pricePerHour) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const hall = await BadmintonHall.findById(hallId);
        if (!hall) {
            return res.status(404).json({ success: false, message: "Badminton hall not found" });
        }

        const newCourt = new Court({
            hallId: hallId,
            name: name,
            matType: matType,
            pricePerHour: pricePerHour
        });
        await newCourt.save();

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
        if (!court) return res.status(404).json({ error: "Court not found" });

        Object.assign(court, req.body);
        await court.save();
        res.json({ message: "Court updated", data: court });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error, could not update court!" });
    }
};

export const deleteCourt = async (req, res) => {
    try {
        const court = await Court.findByIdAndDelete(req.params.courtId);
        if (!court) return res.status(404).json({ error: "Court not found" });

        res.json({ message: "Court deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error, could not delete court!" });
    }
};

export const getCourtById = async (req, res) => {
    try {
        const court = await Court.findById(req.params.courtId);
        if (!court) return res.status(404).json({ error: "Court not found" });

        res.json({ success: true, data: court });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error, could not fetch court!" });
    }
};
export const getAllCourts = async (req, res) => {
    try {
        const courts = await Court.findMany({ hallId: req.params.hallId });
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
        const { courtId } = req.params;
        if (!dayOfWeek || !slots || !courtId) {
            return res.status(400).json({ error: "Day of week, slots and court ID are required" });
        }

        const exists = await CourtAvailability.findOne({ courtId, dayOfWeek });
        if (exists) return res.status(400).json({ error: "Already set for this day" });

        const availability = new CourtAvailability({ courtId, dayOfWeek, slots });
        await availability.save();
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
            { upsert: true }
        );
        if (!availability) return res.status(404).json({ error: "Availability not found" });
        res.json({ message: "Availability updated", availability });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error, could not update availability!", error: err.message });
    }
};