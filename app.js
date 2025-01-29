//************************Library Imports*************** */
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
import cors from 'cors';
//************************File imports****************** */
import VendorInfo from './models/vendor/vendorAuth.model.js';
import Dbotp from './models/Otp.Model.js';
import BadmintonHall from './models/vendor/halls.js';
import User from "./models/user/userAuth.model.js"
import hallroutes from "./routes/vendor/hall.route.js";
import vendorroutes from "./routes/vendor/vendorAuth.route.js";
import userroutes from "./routes/user/userAuth.route.js";
import listingroute from "./routes/user/userListing.route.js";
dotenv.config();
// const dbUrl = "mongodb+srv://hardikmahajan97:tzut2fvAqLl8mfPe@playwisecluster.zfjnl.mongodb.net/PlayWise?retryWrites=true&w=majority&appName=PlayWiseCluster";
// const dbUrl = 'mongodb://localhost:27017';


//************Database Connections on ATLAS************* */
const dbUrl = process.env.MONGO_URI;

// console.log(dbUrl);
main() 
    .then(() =>{
        console.log("Connected to PlayWise DATABASE!");  
    })
    .catch((err) => {
        console.log(err);
    });
async function main() { 
    await mongoose.connect(dbUrl);  
}

//************************************************************* */
let port = 5000;


app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));


//*****************************Configure sessions******************
const store = mongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret : process.env.SESSION_KEY,  //Encrypted by crypto.
    },
    touchAfter : 24 * 3600,  // It is nothing but updating itself after how many time if session is not updated or database has not interacted with the server.
});
store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});
app.use(
    session({
        store,
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        cookie:{        //Cookie expiry date is the deletion of the data stored. For eg. github login: Asks every one week to login again.
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // There default expiry is one week and hence deletes the cookie with the login credentials.
            maxAge : 7 * 24 * 60 * 60 * 1000,
            httpOnly:true, // Only for security purposes.
        },
    })
);
//******************************************************************** */


//***************Passport Initialization****************
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(VendorInfo.authenticate()));
// passport.use(VendorInfo.createStrategy());
passport.serializeUser(VendorInfo.serializeUser());
passport.deserializeUser(VendorInfo.deserializeUser());

//**************************************************** */

//**************Twilio configuration****************** */
// const acc_sid = process.env.TWILIO_AC_SID;
// const acc_auth_token = process.env.TWILIO_AC_AUTH_TOKEN;
// const client = twilio(acc_sid, acc_auth_token);
import client from "./utils/twilioclient.js";

//**************************************************** */


//********************************************Routers************************************************* */

app.listen(port, (req,res) => {
    console.log("Listening on port " + port + ". Welcome to PlayWise!");
});

app.get("/", (req,res) => {
    res.send("Port Checking successful ! Welcome to PlayWise");
});

app.get("/home", (req, res) => {
    console.log("Home Page!");
    res.send("Welcome to PlayWise!");
    
});

//Vendor authentication routes, login and signup.
app.use("/vendor", vendorroutes);

//Hall Dashboard for the vendor and it's features.(CRUD)
app.use("/home-vendor/:id", hallroutes);

//User authentication routes & updating
app.use("/user", userroutes);

//User logs in and This is what he sees. The Badminton halls available near his home,
app.use("/listings/:id", listingroute);


app.get("/get-all-vendors", async (req, res) => {
    try{
        const vendors = await VendorInfo.find({});
        return res.status(200).send(vendors);
    }
    catch(e){
        return res.status(500).json({message: e.message});
    }
});

app.get("/get-vendors/:id", async (req, res) => {
    try{
        const {id} = req.params;
        const vendors = await VendorInfo.findById(id);
        return res.status(200).send(vendors);
    }
    catch(e){
        return res.status(500).json({message: e.message});
    }
});