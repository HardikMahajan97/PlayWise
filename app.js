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
//************************File imports****************** */
import VendorInfo from './models/vendorSignup.js';

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
const acc_sid = process.env.TWILIO_AC_SID;
const acc_auth_token = process.env.TWILIO_AC_AUTH_TOKEN;
const client = twilio(acc_sid, acc_auth_token);

//**************************************************** */


//********************************************Routers************************************************* */
app.get("/", (req,res) => {
    res.send("Port Checking successful ! Welcome to PlayWise");
});
app.listen(port, (req,res) => {
    console.log("Listening on port " + port + ". Welcome to PlayWise!");
});

app.get("/home", (req, res) => {
    console.log("Home Page!");
    res.send("Welcome to PlayWise!");
    
});

app.get("/signup", (req, res) => {
    // const data = {
    //     name: "Hardik",
    //     email: "hardik@gmail.com",
    //     username: "hardikmahajan",
    //     contact: 7249461177,
    //     age : 19,
    //     password : "hardikmahajan@792005",
    //     city: "Jalgaon",
    //     location: "Jivan Nagar"
    // }

    //Render the signup page.
});


app.post("/signup", async (req, res) => {
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
});


app.get("/login", (req,res) => {
    //render login form
})


app.post("/login", (req, res, next) => {
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
            return res.status(200).json({ success: true, message: "Login Success" });
        });
    })(req, res, next);
});

// app.post("/login", passport.authenticate('locals', ())

app.get("/forgotPassword", (req, res) => {
    //render the forgot password page
});

app.post("/forgotPassword", async (req, res) => {
    const {contact} = req.body;

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

    //After the vendor clicks on send otp while, giving the contact number, then we will verify both,
    //the contact number and the otp, and after that we will send the password sms to the vendor.

    //NOTE: this is just the route for the otp generation and sending the otp, verification is remaining.
});


app.post("/verifyOTP", (req, res) => {
    //This function will verify the otp and contact number and send the appropriate response.
    const {otp, contact} = req.body;
});



