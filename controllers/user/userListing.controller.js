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

import User from "../../models/user/userAuth.model.js";
import BadmintonHall from '../../models/vendor/halls.js';


// export const showAllListingsToTheUser = async (req, res) => {
//     try {
//         console.log("Fetching all listings...");

//         // Add basic pagination
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         // First check if there are any halls
//         const totalHalls = await BadmintonHall.countDocuments();
        
//         if (totalHalls === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No badminton halls available"
//             });
//         }

//         // Fetch halls with pagination
//         const listings = await BadmintonHall.find()
//             .populate({
//                 path: 'vendorId',
//                 select: 'Name email contact' // Only select necessary fields
//             })
//             .skip(skip)
//             .limit(limit)
//             .lean()
//             .exec();

//         console.log(`Found ${listings.length} halls`);

//         return res.status(200).json({
//             success: true,
//             totalHalls,
//             currentPage: page,
//             totalPages: Math.ceil(totalHalls / limit),
//             halls: listings
//         });

//     } catch (error) {
//         console.error("Error in showAllListingsToTheUser:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Error fetching badminton halls",
//             error: error.message
//         });
//     }
// };
export const showAllListingsToTheUser = async (req, res) => {
    try {
        console.log("Fetching all listings...");

        const listings = await BadmintonHall.find({})
            .populate({path:'vendorId', select:'Name email contact'}) //Instead of giving vendorId, it will give me the 
            //information of the vendor. If it is getting difficult to undertand ask out on google.
            .exec(); //Executes

        console.log("Fetched listings:", listings);
        return res.status(200).json({ success: true, data: listings });
    } catch (e) {
        console.error("Error fetching listings:", e);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
};

export const getOneParticularListing = async(req, res) => {
    try{
        const {id}= req.params;
        const listing = await BadmintonHall.findById(id);
        return res.status(200).json({ data:listing});

    } catch(e){
        return res.status(500).json({ success: false, message:"Internal Server Error", error: e.message });
    }   
} 