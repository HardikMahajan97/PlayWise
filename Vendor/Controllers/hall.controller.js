import express from 'express';
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import session from "express-session";
import mongoStore from "connect-mongo";
import LocalStrategy from "passport-local";
import twilio from "twilio";
import {v4 as uuidv4} from "uuid";

//************************File imports****************** */
import VendorInfo from '../Models/vendorAuth.model.js';
import BadmintonHall from '../Models/halls.js';


//****************************************************** */
export const showAllHalls = async (req, res) => {
    try{
        const {id} = req.params;
        // console.log(id);
        const halls = await BadmintonHall.find({vendorId:id});
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
            address, 
            city, 
            state, 
            country, 
            Name, 
            image, 
            slots, 
            price, 
            amenities, 
            numberOfCourts, 
            matType, 
            additionalInfo, 
        } = req.body;

        if(
        !address || 
        !city || 
        !state || 
        !country || 
        !Name || 
        !image || 
        !slots || 
        !price || 
        !amenities ||
        !numberOfCourts || 
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
        const newCourt = new BadmintonHall({
            address, 
            city, 
            state, 
            country, 
            Name, 
            image, 
            slots, 
            price, 
            amenities, 
            numberOfCourts, 
            matType, 
            additionalInfo, 
            vendorId
        });
        const savedHall = await newCourt.save();
        return res.status(200).json({ success: true, data: {savedHall} });
    }
    catch(e){
        console.error(e);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateHall = async(req, res) => {
    try{
        const {id} = req.params;
        let hall = await BadmintonHall.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        if(!hall) return res.status(404).json({ success:false, message:"Hall not found"});

        return res.status(200).json({ success:true, data:hall });
        //render the update form.
    }
    catch(e){
        return res.status(500).json({ success:false, message:"Internal Server Error"});
    }
};

export const deleteHall = async (req, res) => {
    try{
        const {id} = req.params;
        await BadmintonHall.findByIdAndDelete(id);
        if(totalHalls > 0){
            totalHalls--;
        }
        
        return res.status(200).json({ success:true, message:`Listing Deleted. Total Halls now :${totalHalls}`});
    }
    catch(e){
        return res.status(500).json({ success:false, message:"Internal Server Error"});
    }
};