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
        secret : process.env.SESSION_KEY,  //Encryption
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


app.post("/signup",  async (req, res) => {
    const {Name, email, username, contact, age, password, city, location} = req.body;
    
    if(!Name || !email || !username || !contact || !age || !password || !city || !location){
        return res.status(404).json({success: false, message:"Vendor Not listed porperly!"});
    }
    try{
        const newVendor = new VendorInfo({Name, email, username, contact, age, password, city, location});
        // console.log(newVendor);
        const registeredVendor = await VendorInfo.register(newVendor, password);
        // console.log(registeredVendor);
        return res.status(200).json({success : true, data : registeredVendor});
        // console.log(registeredVendor);
    }
    catch(e){
        return res.status(500).json({success: false, message:"Internal Server Error"});
    }
    // const newVendor = new VendorInfo({name, username, password, email, contact, age, city, location});
    // await newVendor.save();
    // console.log(newVendor);
});


app.get("/login", (req,res) => {
    //render login form
})


app.post("/login", (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
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