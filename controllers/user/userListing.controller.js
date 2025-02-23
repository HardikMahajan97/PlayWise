import express from 'express';
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";
import {Resend} from "resend";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import session from "express-session";
import mongoStore from "connect-mongo";
import LocalStrategy from "passport-local";
import twilio from "twilio";
import {v4 as uuidv4} from "uuid";
// import client from "../../utils/twilioclient.js";
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

import User from "../../models/user/userAuth.model.js";
import BadmintonHall from '../../models/vendor/halls.js';
import Booking from "../../models/bookings.models.js";
import VendorInfo from "../../models/vendor/vendorAuth.model.js";
import moment from "moment";
import FormData from "form-data";
dotenv.config();

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

        return res.status(200).json({listing, id, hallId});

    } catch(e){
        console.log(e.message);
        return res.status(500).json({ success: false, message:"Internal Server Error", error: e.message });
    }
}

//Create the booking for the user
async function createBooking(userId, hallId, vendorId, slotHour, date, courtNumber){

    //Converts the date to hour.
    const slotTime = moment(date).set({
        hour: slotHour,
        minute: 0,
        second: 0,
        millisecond: 0
    }).toDate();
    const expiry = moment(slotTime).add(1, 'hour').toDate(); // 1 hour expiry for booking.
    const booking = await new Booking({
        userId: userId,
        vendorId: vendorId,
        expiryForBooking: expiry,
        slot: slotTime,
        isBooked:true,
        isSlotBooked:true,
        isCourtBooked:true,
        date: date,
        courtNumber:courtNumber,
    });
    await booking.save();
    return booking;
}

async function checkSlot(slot){
    const slotBooked = await Booking.findOne({
        slot:slot,
        isSlotBooked:false,
    });
    console.log(`We have this slot ${slotBooked } in checkSlot function`);
    return slotBooked;
}

const checkCourtAvailableOrNot = async (courtNumber) => {
    const court = await Booking.findOne({
        //Ig new court Schema?
        courtNumber:courtNumber,
        isCourtBooked:true,
    });
    return court;

}

async function sendEmail(userEmail, vendorEmail){
    try {

        const getUser = await User.findOne({email: userEmail});
        const getVendor = await VendorInfo.findOne({email: vendorEmail});

        const resend = new Resend('re_4jXu5W6L_GL3EMbLXy34xN7Ex9nhenKNG');
        resend.emails.send({
            from: 'onboarding@resend.dev',
            to: userEmail.email,
            subject: 'Booking Success',
            html: '<p>Your booking has been successfully completed! Here are your details: <br>' +
                'Your court name is: dummy name <br>' +
                'Your court number: dummy number<br>' +
                'Your time slot is: dummy slot<br>' +
                'Date: dummy date<br>' +
                '' +
                'Thank you for the booking! We will be waiting for you!</p>'
        });

        resend.emails.send({
            from: 'onboarding@resend.dev',
            to: vendorEmail.email,
            subject: 'Booking Success',
            html: '<p>You have a booking! <br> ' +
                'Here are your customer details:<br>' +
                'Name: dummy name<br>' +
                'Date and Slot: Dummy date and slot<br>' +
                'Court Number: dummy number<br>' +
                'Amout paid: dummy amount paid' +
                'The booking amount has by now been reflected in your account. ' +
                'Call on dummy number for any confusion or grievances</p>'
        });
    }
    catch(err){
        return err.message;
    }
    return true;
}

async function getEmail(user, id){
    return await user.findById(id).select("email");
}

export const bookThisListing = async(req, res) => {
    try{
        const {id, hallId} = req.params;

        const listing = await BadmintonHall.findById(hallId)
            .populate({path:'vendorId', select:'Name email contact'})
            .exec();
        if (!listing) return res.status(404).json({ success: false, message: "Hall not found" });

        const vendorId = listing.vendorId;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const {slot, date, courtNumber} = req.body;
        const slotHour = parseInt(slot);

        /*
        * 1. Send the booking update to the vendor through email service.
        * 2. Make the listing status as booked for the particular court(First make the court(s) system for one hall).
        * 3. After the expiry of one hour, reset the booking status of the booking status.
        * 4. Send the confirmation message to the user through email(Write a email service).
        * 5. Update the rubrics for the vendor: Increase the count of unique or repeated user, Current players on your court,
        *    particular hall booking count, Total earnings, available slots and bookings for the current hall and vendor.
        * 6. INTEGRATE A PAYMENT GATEWAY.
        * 7. Update the slot booking, whether it is booked or not.
        * */

        /*
        * Select the booking option.
        * 1. Select the DATE, SLOT and COURT number in that particular hall.
        * 2. Let him add multiple courts to the cart(Call the step 1 function again).
        * 3. Go to cart.
        * 4. Review the bookings page.
        * 5. Payment method.
        * */

        //Check for the slot if it is already booked, return.
        // const CheckSlot = await checkSlot(slot);
        // console.log(`Your Slot is ${CheckSlot}`);
        // if(!CheckSlot){
        //     return res.status(401).json({success:false, message:"Slot is already booked, Please select another slot"});
        // }
        // //Check for the court availability;
        // const checkCourt = await checkCourtAvailableOrNot(courtNumber);
        // console.log(`Your Court is ${checkCourt}`);
        // if(!checkCourt) return res.status(500).json({success:false, message:"Internal Server Error in checking court"});

        //Everything fine? Create Booking : return Error;
        const booking = await createBooking(id, hallId, vendorId, slotHour, date, courtNumber);
        console.log(`Your booking status is: ${booking}`);
        if(!booking) return res.status(500).json({success:false, message:"Internal Server Error in booking court"});

        const userEmail = await getEmail(User, id);
        const vendorEmail = await getEmail(VendorInfo, vendorId);
        // console.log(`User email: ${userEmail}`);
        // console.log(`Vendor email: ${vendorEmail}`);
        // console.log(`Actual Email ${userEmail.email}`);

        /*THE FOLLOWING EMAIL SERVICE WORK PERFECTLY, IT IS COMMENTED JUST TO SAVE THE FREE EMAILS PER DAY AND NOT HITTING
        * THE API
        * */
        //Notifying the user about the booking
        // const SendEmail = await sendEmail(userEmail, vendorEmail);
        // console.log(`Email Status: ${SendEmail}`);
        // if(SendEmail != true){
        //     return res.status(500).json({Success:false, message:`Internal Server Error while sending Email. Error: ${SendEmail}`});
        // }



        return res.status(200).json({success:true, message:"Booking Successful, Check your emails!"});

      }catch(e){
        return res.status(500).json(e.message);
    }
}