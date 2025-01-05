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
import crypto from 'crypto';

import User from "../../models/user/userAuth.model.js";
import otpModel from "../../models/Otp.Model.js";
import client from "../../utils/twilioclient.js";

let userCount = 0;
export const userSignup = async (req, res) => {
        const {Name, email, username, contact, age, password} = req.body;
        
        if(!Name || !email || !username || !contact || !age || !password){
            return res.status(400).json({success: false, message:"User Not listed properly!"});
        }
        try {
            const newUser = new User({Name, email, username, contact, age});
            console.log("New User:", newUser);
            
            const registeredUser = await User.register(newUser, password);
            console.log("Registered User:", registeredUser);
            userCount++;
            req.login(registeredUser, (err) => {
                if(err){
                    console.error("Login error:", err);
                    return res.status(500).json({success: false, message: "Error during login", error: err.message});
                }

                return res.status(200).json({success: true, data: registeredUser});
            });
        }
        catch(e) {
            console.error("Registration error:", e);
            return res.status(500).json({success: false, message: "Internal Server Error", error: e.message});
        }
};

export const userLogin = (req, res, next) => {
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
            return res.status(401).json({ success: false, message: "Invalid username or password" });
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

// export const just = async ( req, res) => {
//     const {id} = req.params;
//     const user = await User.findById(id);
//     console.log(user);
//     if(!user){
//         return res.status(404).json({success: false, message: "user not found"});
//     }
//     return res.status(200).json({success:true, data:user});
// };

export const updateUserInfo = async(req, res) => {
    try{
        const {id}= req.params;

        const updatedUserInfo = await User.findByIdAndUpdate(id, {...req.body}, { writeConcern: { w: 'majority' } });
        res.json(updatedUserInfo);
    }
    catch(e){
        res.json({message: e.message});
    }
};


//Get method to render the validation form which prompts the user to send the valid contact number.
export const renderValidationForm = async (req, res) => {
    res.redirect("validationFormLink");
}

//Post method which checks if the phone number and the user exists, and then generated the otp while rendering,
//the otp page which prompts the user to submit the otp sent on the provided contact number.
export const validateAndGenerateOtp = async(req, res) => {
    try {

        const {id} = req.params;
        const user = await User.findById(id);
        const {contact} = req.body;
        const checkPhone = await User.findOne({contact:contact});
        if(!user || !checkPhone){
            return res.status(404).json({
                success:false,
                message:"user not found"
            });
        }

        //Generating a 6 digit otp
        const Otp = crypto.randomInt(100000, 999999).toString(); //6 Digit Otp
        const expiry = new Date(Date.now() + 5 * 60 * 1000); //5 minutes expiry

        const otpRecord = new otpModel({contact, Otp, expiry});
        await otpRecord.save();

        //Send the Otp through twilio client
        const message = await client.messages.create({
            body: `Your OTP is ${Otp}. It is valid for 5 minutes.`,
            to: contact,     // Recipient's phone number
            from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
        });
        console.log("Message sent:", message.sid);


        //Render the otp form to submit the otp, instead of this;
        return res.status(200).json({success: true, message:`Your otp is sent successfully, OTP: ${message.sid} OR ${Otp}.`});
    }
    catch (error) {
        // console.error("Error sending OTP:", error);
        return res.status(400).json({success:false, message:`Something went wrong! ${error.message}`});
    }
};


//GET method to render the otp method.
export const renderOtpForm = async(req, res) => {
    try{
        res.redirect("OtpForm");
    }
    catch(e){
        res.json({message: `${e.message}`});
    }
};

export const verifyOtpAndSendPasswordOnContact = async (req, res) => {
    try{
        const {Otp} = req.body;
        const otpRecord = await otpModel.findOne({
            Otp: Otp,
            isUsed: false
        });

        if (!otpRecord) {
            throw new Error('Invalid or expired OTP');
        }

        // Check expiration
        if (Date.now() > otpRecord.expiry) {
            throw new Error('OTP has expired');
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        return res.status(200).json({success:true, data:otpRecord});
    }catch(e){
        return res.json({message:`${e.message}`});
    }
};

