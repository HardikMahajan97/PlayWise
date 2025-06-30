import express from 'express';
import passport from "passport";
import crypto from 'crypto';

import User from "../models/userAuth.model.js";
import otpModel from "../models/Otp.Model.js";
import client from "../utils/twilioclient.js";

const app = express();

let userCount = 0;
export const userSignup = async (req, res) => {
        const {name, email, username, contact, age, password} = req.body;
        
        if(!name || !email || !username || !contact || !age || !password){
            return res.status(400).json({success: false, message:"User Not listed properly!"});
        }
        try {
            const newUser = new User({name, email, username, contact, age});
            console.log("New User:", newUser);
            
            const registeredUser = await User.register(newUser, password);
            console.log("Registered User:", registeredUser);
            userCount++;
            req.login(registeredUser, async (err) => {
                if(err){
                    console.error("Login error:", err);
                    return res.status(500).json({success: false, message: "Error during login", error: err.message});
                }

                const user = await User.findOne({username:username});
                const id = user._id;
                return res.status(200).json({success: true, data: {registeredUser, id}});
            });
        }
        catch(e) {
            console.error("Registration error:", e);
            return res.status(500).json({success: false, message: "Internal Server Error", error: e.message});
        }
};

export const userLogin = async (req, res, next) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(404).json({success:false, message:"Enter all the fields"});
    }

    passport.authenticate("user-local", async (err, user, info) => {

        if (err) {
            // Handle error if there is any during authentication
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        if (!user) {
            console.log("Authentication failed:", info);
            return res.status(401).json({
                success: false,
                message: info?.message || "Invalid credentials"
            });
        }

        // If authentication is successful, log the user in and send the success response
        req.login(user, async (err) => {
            if (err) {
                // Handle error during session login
                return res.status(500).json({ success: false, message: "Could not establish session" });
            }

            // Authentication successful
            //redirect the home page or the required page here.
            const user = await User.findOne({username:username});
            const id = user._id;
            return res.status(200).json({id});
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
        const {userId}= req.params;
        if(!userId) return res.status(404).json({success:false, message:"User not found"});

        const updatedUserInfo = await User.findByIdAndUpdate(
            userId,
            {...req.body},
            { writeConcern: { w: 'majority' } }
        );
        return res.status(200).json({success: true, data: updatedUserInfo});
    }
    catch(e){
        return res.status(500).json({message: e.message});
    }
};


//Post method which checks if the phone number and the user exists, and then generated the otp while rendering,
//the otp page which prompts the user to submit the otp sent on the provided contact number.
export const validateAndGenerateOtp = async(req, res) => {
    try {
        const {contact} = req.body;
        const checkPhone = await User.findOne({contact:contact});
        if(!checkPhone){
            return res.status(404).json({
                success:false,
                message:"user not found"
            });
        }

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
        return res.status(200).json({success: true, message:`Your otp is sent successfully.`});
    }
    catch (error) {
        // console.error("Error sending OTP:", error);
        return res.status(400).json({success:false, message:`Something went wrong! ${error.message}`});
    }
};

export const verifyOtp = async (req, res) => {
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

export const changePassword = async (req, res, next) => {
    const {username, newPassword, confirmPassword} = req.body;

    try{
        console.log('Reached Change Password')
        const user = await User.findOne({username: username});

        if(!user){
            return res.status(404).json({message:`Internal Server Error`});
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({message:`Bad Request, Enter the correct password in both fields, and try again!`});
        }

        await user.setPassword(newPassword);

        await user.save();

        req.login(user, async (err) => {
            if (err) {
                // Handle error during session login
                return res.status(500).json({ success: false, message: "Could not establish session" });
            }

            //Authentication successful
            //redirect the home page or the required page here.
            const user = await User.findOne({username:username});
            const userID = user._id;
            return res.status(200).json({
                success: true,
                message: "Password reset successful. You are now logged in.",
                user: {
                    id: user._id,
                    username: user.username,
                },
            });
        });

    }catch(e){
        console.error(e.message);
    }
}

export const deleteAllUsers = async (req, res) => {
    try {
        await User.deleteMany({});
        return res.status(200).json({success: true, message: "All users deleted successfully."});
    } catch (err) {
        return res.status(500).json({success: false, message: "Error deleting users", error: err.message});
    }
}
