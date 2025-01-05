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
import VendorInfo from '../../models/vendor/vendorAuth.model.js';
import Dbotp from '../../models/Otp.Model.js';
import BadmintonHall from '../../models/vendor/halls.js';

//**************Twilio configuration****************** */
import client from "../../utils/twilioclient.js";
dotenv.config();
//**************************************************** */


export const signup = async (req, res) => {
    const {Name, email, username, contact, age, password, city, location} = req.body;
    
    if(!Name || !email || !username || !contact || !age || !password || !city || !location){
        return res.status(400).json({success: false, message:"Vendor Not listed properly!"});
    }
    try {
        const newVendor = new VendorInfo({Name, email, username, contact, age, city, location});
        console.log("New Vendor:", newVendor);
        
        const registeredVendor = await VendorInfo.register(newVendor, password);
        console.log("Registered Vendor:", registeredVendor);
        
        req.login(registeredVendor, (err) => {
            if(err){
                console.error("Login error:", err);
                return res.status(500).json({success: false, message: "Error during login", error: err.message});
            }
            return res.status(200).json({success: true, data: registeredVendor});
        });
    }
    catch(e) {
        console.error("Registration error:", e);
        return res.status(500).json({success: false, message: "Internal Server Error", error: e.message});
    }
};

export const login = (req, res, next) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(404).json({success:false, message:"Enter all the fields"});
    }

    passport.authenticate("local", (err, user, info) => {
        if (err) {
            // Handle error if there is any during authentication
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        if (!user) {
            // Handle invalid login (wrong credentials or user not found)
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // If authentication is successful, log the user in and send the success response
        req.login(user, (err) => {
            if (err) {
                // Handle error during session login
                return res.status(500).json({ success: false, message: "Could not establish session" });
            }

            // Authentication successful
            //redirect the home page or the required page here.
            return res.status(200).json({ success: true, message: "Login Success" });
        });
    })(req, res, next);
};

export const updateVendorInfo = async(req, res) => {
    try{
        const {id}= req.params;

        const updatedVendorInfo = await VendorInfo.findByIdAndUpdate(id, {...req.body}, { writeConcern: { w: 'majority' } });
        res.json(updatedVendorInfo);
    }
    catch(e){
        res.json({message: e.message});
    }
};

export const checkIDForVerification = async (req, res) => {
    //render the forgot password page

    //First check if the id is correct or not and then redirect the forgot password form.

    const {id} = req.params;
    console.log("Id sent by the client");
    console.log(id);
    const checkId = await VendorInfo.findById(id);
    console.log(`This the response returned from the database ${checkId._id}`);
    if(id == checkId._id) {
        return res.status(200).send("Id matched");
        //redirect the forgot password form
    }
    else{
        return res.status(400).json({Success:false});
    }
};

export const sendOTP = async (req, res) => {
    const {contact} = req.body;

    //Verify the contact is present or not.

    //otp generation and slicing
    const otp = uuidv4().replace(/-/g, "").slice(0, 6);
    try {
        const message = await client.messages.create({
            body: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            to: contact,     // Recipient's phone number
            from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
        });
        console.log("Message sent:", message.sid);
        //render the password through sms if verified.
        return res.status(200).json({success: true, message:`Your otp is sent successfully, OTP: ${message.sid} OR ${otp}.`});
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(400).json({success:false, message:`Something went wrong! ${error.message}`});
    }

};

//NOTE ::::: This function is not complete and tested, dont use it before testing.
export const verifyOTP = async(req, res) => {
    //This function will verify the otp and contact number and send the appropriate response.
    const {OTP} = req.body;

    //This line wont work.
    const dbotp = await Dbotp.findOne({OTP:OTP});
    if(!dbotp || !OTP || ( dbotp.OTP != OTP ) ){
        return res.status(404).json({success:false, message:"OTP not found"});
    }
    //send the password from the database by decoding it using passport. See the docs
    //https://stackoverflow.com/questions/17828663/passport-local-mongoose-change-password
    return res.status(200).json({success:true, message:`You are verified`});   

};