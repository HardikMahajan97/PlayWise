import express from 'express';
const router = express.Router({ mergeParams: true });
import VendorInfo from '../../models/vendor/vendorSignup.js';
import { signup, login, checkIDForVerification, sendOTP, verifyOTP } from "../../controllers/vendor/user.controller.js";

router
    .route("/signup")
    .post(signup);

router
    .route("/login")
    .post(login);

router
    .post("/forgotPassword", sendOTP); // POST to send OTP

router
    .get("/forgotPassword/:id", checkIDForVerification); // GET to verify ID

router
    .route("/verifyOTP")
    .post(verifyOTP);

export default router;
