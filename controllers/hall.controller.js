import express from 'express';

//************************File imports****************** */
import VendorInfo from '../models/vendorAuth.model.js';
import BadmintonHall from '../models/BadmintonHall.model.js';
import sendEmail from "../utils/SendEmail.js";
import generateHallEmail from "../utils/generateHallEmail.js";


const app = express();


//****************************************************** */
export const showAllHalls = async (req, res) => {
    try{
        const {vendorId} = req.params;
        // console.log(vendorId);
        const halls = await BadmintonHall.find({vendorId:vendorId});
        if (!halls || halls.length === 0) {
            return res.status(404).json({ success: false, message: "No listings found" });
        }
        return res.status(200).json(halls);
        //Dashboard is still remaining.
    }
    catch(e){
        return res.status(500).json({message:`${e}`});
    }
};

export const showHall = async(req, res) => {
    try{
        const {hallId} = req.params;

        const hall = await BadmintonHall.findById(hallId);
        if(hall)
        return res.status(200).json({ success:true, data: hall});
        else
        return res.status(404).json({success:false, message:"Hall not found"});
    }
    catch(e){
        return res.status(500).json({ success:false, message:e});
    }

};

export const createHall = async (req, res) => {
    try{
        const {
            name, address, city, state, amenities, image, numberOfCourts, additionalInfo, pricePerHour, matType
        } = req.body;

        if(
        !address || 
        !city || 
        !state || 
        !name ||
        !image || 
        !amenities ||
        !numberOfCourts ||
        !pricePerHour ||
        !matType
    )
        {
            return res.status(404).json({success: false, message: "Details not given properly, enter all the details."});
        }
        const {vendorId} = req.params;

        const vendor = await VendorInfo.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }
        console.log("Name of the hall:", name);
        const newCourt = new BadmintonHall({
            address: address,
            city: city,
            state: state,
            name: name,
            image: image,
            amenities: amenities,
            numberOfCourts: numberOfCourts,
            additionalInfo: additionalInfo,
            pricePerHour: pricePerHour,
            matType: matType,
            vendorId: vendorId
        });
        const savedHall = await newCourt.save();
        const emailHtml = generateHallEmail("create", savedHall, vendor.name);
        await sendEmail(vendor.email, `🎉 Hall Listed: ${savedHall.name}`, emailHtml);

        return res.status(200).json({ success: true, data: {savedHall} });
    }
    catch(e){
        console.error(e);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateHall = async(req, res) => {
    try{
        const {hallId} = req.params;
        let hall = await BadmintonHall.findByIdAndUpdate(hallId, req.body, { new: true, runValidators: true });
        
        if(!hall) return res.status(404).json({ success:false, message:"Hall not found"});

        const vendor = await VendorInfo.findById(hall.vendorId);
        const emailHtml = generateHallEmail("update", hall, vendor.name, req.body);
        await sendEmail(vendor.email, `✏️ Hall Updated: ${hall.name}`, emailHtml);

        return res.status(200).json({ success:true, data:hall });
    }
    catch(e){
        return res.status(500).json({ success:false, message:"Internal Server Error"});
    }
};

export const deleteHall = async (req, res) => {
    try{
        const {hallId} = req.params;
        const hall = await BadmintonHall.findById(hallId);
        if (!hall) return res.status(404).json({ success: false, message: "Hall not found" });

        await BadmintonHall.findByIdAndDelete(hallId);

        const vendor = await VendorInfo.findById(hall.vendorId);
        const emailHtml = generateHallEmail("delete", hall, vendor.name);
        await sendEmail(vendor.email, `🗑️ Hall Deleted: ${hall.name}`, emailHtml);

        const totalHalls = await BadmintonHall.countDocuments({ vendorId: req.params.vendorId });
        return res.status(200).json({ success:true, message:`Listing Deleted. Total Halls now :${totalHalls}`});
    }
    catch(e){
        return res.status(500).json({ success:false, message:"Internal Server Error"});
    }
};