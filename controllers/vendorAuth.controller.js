import express from 'express';
import dotenv from "dotenv";
import passport from "passport";

//************************File imports****************** */
import VendorInfo from '../models/vendorAuth.model.js';
import otpModel from '../models/Otp.Model.js';

//**************Twilio configuration****************** */
import client from "../utils/twilioclient.js";
import crypto from "crypto";

const app = express();

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
async function getVendor(username){
    return await VendorInfo.findOne({username: username});
}

export const login = async (req, res, next) => {
    const {username, password} = req.body;

    if(!username || !password){
        return res.status(404).json({success:false, message:"Enter all the fields"});
    }

    passport.authenticate("vendor-local", async (err, user, info) => {
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

            //Authentication successful
            //redirect the home page or the required page here.
            const vendor = await getVendor(username);
            const vendorID = vendor._id;
            return res.status(200).json({vendorID});
        });
    })(req, res, next);
};

export const deleteVendor = async(req, res) => {
    try{
        const {vendorId} = req.params;
        await VendorInfo.findByIdAndDelete(vendorId);
        return res.status(200).json({success:true, message:`Vendor Deleted successfully`});
    }catch(e){
        return res.status(500).send("InternalServerError." + e.message);
    }
}

export const updateVendorInfo = async(req, res) => {
    try{
        const {vendorId}= req.params;

        const user = await VendorInfo.findById(vendorId);
        if(!user) return res.status(404).json({success:false, message:"User not found"});

        const updatedVendorInfo = await VendorInfo.findByIdAndUpdate(id, {...req.body}, { writeConcern: { w: 'majority' } });
        return res.json({updatedVendorInfo});
    }
    catch(e){
        return res.json({message: e.message});
    }
};

export const validateAndGenerateOtp = async(req, res) => {
    try {

        const {contact} = req.body;
        const checkPhone = await VendorInfo.findOne({contact:contact});
        if(!checkPhone){
            return res.status(404).json({
                success:false,
                message:"user not found"
            });
        }

        //Generating a 6 digit otp
        const Otp = crypto.randomInt(100000, 999999).toString(); //6 Digit Otp
        const expiry = new Date(Date.now() + 3 * 60 * 1000); //5 minutes expiry

        const otpRecord = new otpModel({contact, Otp, expiry});
        await otpRecord.save();

        //Send the Otp through twilio client
        const message = await client.messages.create({
            body: `Your OTP is ${Otp}. It is valid for 3 minutes.`,
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

export const verifyOtp = async (req, res) => {
    try{

        const { Otp } = req.body;
        console.log("Received OTP from request:", Otp);

        const otpRecord = await otpModel.findOne({
            Otp: Otp,
            isUsed: false
        });
        console.log("Found OTP record:", otpRecord);

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
        return res.status(500).json({success:false, message:`${e.message}`});
    }
};

export const changePassword = async (req, res, next) => {
    const {username, newPassword, confirmPassword} = req.body;

    try{
        console.log('Reached Change Password')
        const vendor = await VendorInfo.findOne({username: username});

        if(!vendor){
            return res.status(404).json({message:`Vendor not found`});
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({message:`Bad Request, Enter the correct password in both fields, and try again!`});
        }

        await vendor.setPassword(newPassword);

        await vendor.save();

        req.login(vendor, async (err) => {
            if (err) {
                // Handle error during session login
                return res.status(500).json({ success: false, message: "Could not establish session" });
            }

            //Authentication successful
                return res.status(200).json({
                    success: true,
                    message: "Password reset successful. You are now logged in.",
                    vendor: {
                        id: vendor._id,
                        username: vendor.username,
                    },
                });
            });

    }catch(e){
        console.error(e.message);
    }
}

export const deleteAllVendors = async (req, res) => {
    try {
        await VendorInfo.deleteMany({});
        return res.status(200).json({success: true, message: "All vendors deleted successfully."});
    } catch (error) {
        console.error("Error deleting all vendors:", error);
        return res.status(500).json({success: false, message: "Internal Server Error", error: error.message});
    }
};
