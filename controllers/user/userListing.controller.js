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
import client from "../../utils/twilioclient.js";

import User from "../../models/user/userAuth.model.js";
import BadmintonHall from '../../models/vendor/halls.js';
import Booking from "../../models/bookings.models.js";


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
            //information of the vendor. If it is getting difficult to understand ask out on Google.
            .exec(); //Executes

        console.log("Fetched listings");
        return res.status(200).json(listings);
    } catch (e) {
        console.error("Error fetching listings:", e);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
    }
};

export const getOneParticularListing = async(req, res) => {
    try{
        const {id, hallId}= req.params;
        console.log("Reached the function");
        const listing = await BadmintonHall.findById(hallId)
            .populate({path:'vendorId', select:'Name email contact'}) //Instead of giving vendorId, it will give me the
            //information of the vendor. If it is getting difficult to understand ask out on Google.
            .exec(); //Executes
        // ;
        console.log("Sending your court!");
        return res.status(200).json(listing);

    } catch(e){
        console.log(e.message);
        return res.status(500).json({ success: false, message:"Internal Server Error", error: e.message });
    }
}

export const bookThisListing = async(req, res) => {
    try{
        const {id, hallId} = req.params;

        //Take the hall id and get the vendor details from there to get his contact and details.
        //from vendor details, just get him messaged that his court is booked and which court is booked.
        //Again, from user id get the details of the user.
        //Finally, Once the vendor knows, change the court numbers that are to be booked and  update the dashboard of the
        //vendor, with all the details.

        const listing = await BadmintonHall.findById(hallId)
            .populate({path:'vendorId', select:'Name email contact'})
            .exec();

        const user = await User.findById(id);

        /*
        * 1. Send the booking update to the vendor through email service.
        * 2. Make the listing status as booked for the particular court(First make the court(s) system for one hall).
        * 3. After the expiry of one hour, reset the booking status of the booking status.
        * 4. Send the confirmation message to the user through email(Write a email service).
        * 5. Update the rubrics for the vendor: Increase the count of unique or repeated user, Current players on your court,
        *    particular hall booking count, Total earnings, available slots and bookings for the current hall and vendor.
        * 6. INTEGRATE A PAYMENT GATEWAY.
        * */

        /*
        * Select the booking option.
        * 1. Select the DATE, SLOT and COURT number in that particular hall.
        * 2. Let him add multiple courts to the cart(Call the step 1 function again).
        * 3. Go to cart.
        * 4. Review the bookings page.
        * 5. Payment method.
        * */

        /*
        * User gives:
        * Slot,
        * Date,
        * Court number(s),
        * Amount
        * */



    }catch(e){
        return res.status(500).json(e.message);
    }
}