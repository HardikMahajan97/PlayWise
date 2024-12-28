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

