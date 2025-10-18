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
        console.log("✅ Connected to PlayWise DATABASE!");  
    })
    .catch((err) => {
        console.log("❌ Database Connection Error:", err);
    });
async function main() { 
    await mongoose.connect(dbUrl);  
}

//************************************************************* */
let port = process.env.PORT || 5000; // CHANGE: Use PORT from environment (Render provides this), fallback to 5000

// CHANGE: Updated CORS configuration to allow frontend from Vercel and local development
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from frontend URL (Vercel), localhost, or no origin (same server)
        const allowedOrigins = [
            'http://localhost:5173',           // Vite dev server
            'http://localhost:3000',           // Alternative dev port
            process.env.FRONTEND_URL || '*'    // Vercel production frontend (set in Render env vars)
        ];
        
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // CHANGE: Added to support sessions across domains
}));

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
store.on("error", (err) => { // CHANGE: Fixed error handler - was missing 'err' parameter
    console.log("❌ ERROR in MONGO SESSION STORE:", err);
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
            httpOnly: true, // Only for security purposes.
            // CHANGE: Added secure cookie for production (HTTPS only)
            secure: process.env.NODE_ENV === 'production',
            // CHANGE: Added sameSite for CSRF protection
            sameSite: 'Lax' // Allows cookies with cross-site requests (needed for Vercel -> Render)
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
    console.log("📤 Serializing:", entity.constructor.modelName, entity.id);
    done(null, {
        id: entity.id,
        type: entity.constructor.modelName
    });
});

// Deserialize user from session
passport.deserializeUser(async (obj, done) => {
    try {
        console.log("📥 Deserializing:", obj.type, obj.id);

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
        console.error("❌ Deserialization error:", err);
        done(err);
    }
});

//**************************************************** */
//********************************************Routers************************************************* */

app.get("/", (req,res) => {
    res.send("Port Checking successful ! Welcome to PlayWise");
});

// Health check endpoint (used by Render to verify service is running)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'PlayWise API is running' });
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
app.use("/halls/:vendorId/:hallId", courtRoutes); // Routes to be sorted...
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

// 404 error handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

//**CHANGE: Export app for production deployment on Render (Render expects a module export)
export default app;

// CHANGE: Start server only if not in production with specific handling
// In Render, the "start" command in package.json will run this file
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
    });
} else {
    // In production (Render), still listen but don't log the URL
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 PlayWise API running on port ${port}`);
    });
}