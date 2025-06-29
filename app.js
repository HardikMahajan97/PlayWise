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
import{Resend} from "resend";
//************************File imports****************** */
import VendorInfo from './models/vendorAuth.model.js';
import BadmintonHall from './models/BadmintonHall.model.js';
import User from "./models/userAuth.model.js"
import hallRoutes from "./routes/hall.route.js";
import vendorRoutes from "./routes/vendorAuth.route.js";
import userRoutes from "./routes/userAuth.route.js";
import listingRoutes from "./routes/userListing.route.js";
import bookingRoutes from "./routes/Booking.route.js";
import courtRoutes from "./routes/Court.route.js";
dotenv.config();

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
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Strategy for User authentication
passport.use("user-local", new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    User.authenticate() // This comes from passport-local-mongoose
));

// Strategy for Vendor authentication
passport.use("vendor-local", new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    VendorInfo.authenticate() // This comes from passport-local-mongoose
));

// Serialize user for session
passport.serializeUser((entity, done) => {
    console.log("Serializing:", entity.constructor.modelName, entity.id);
    done(null, {
        id: entity.id,
        type: entity.constructor.modelName
    });
});

// Deserialize user from session
passport.deserializeUser(async (obj, done) => {
    try {
        console.log("Deserializing:", obj.type, obj.id);

        let Model;
        if (obj.type === "User") {
            Model = User;
        } else if (obj.type === "VendorInfo") {
            Model = VendorInfo;
        } else {
            return done(new Error('Invalid user type: ' + obj.type));
        }

        const user = await Model.findById(obj.id);
        if (!user) {
            return done(new Error('User not found'));
        }

        done(null, user);
    } catch (err) {
        console.error("Deserialization error:", err);
        done(err);
    }
});

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
app.use("/vendor", vendorRoutes);

//Hall Dashboard for the vendor and it's features.(CRUD)
app.use("/home-vendor/:vendorId", hallRoutes);

//User authentication routes & updating
app.use("/user", userRoutes);

//User logs in and This is what he sees. The Badminton halls available near his home,
app.use("/listings/:userId", listingRoutes);

//Booking related routes
app.use("/booking/:userId", bookingRoutes); // Routes to be sorted...

//Court & halls related routes
app.use("/halls/:hallId", courtRoutes); // Routes to be sorted...
/********************************* Test Routes **************************/

app.get("/get-all-vendors", async (req, res) => {
    try{
        const vendors = await VendorInfo.find({});
        return res.status(200).send(vendors);
    }
    catch(e){
        return res.status(500).json({message: e.message});
    }
});

app.get("/delete-all-listings", async (req, res) => {
    try {
        await BadmintonHall.deleteMany({});
        return res.status(200).json({message: "All listings deleted successfully"});
    } catch (err) {
        return res.status(500).json({message: "Error deleting listings", error: err.message});
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

app.get("/get-all-users", async(req, res) => {
    try{
        const users = await User.find({});
        return res.status(200).json({users: users});
    }catch(e){
        return res.status(500).json({message: e.message});
    }
});