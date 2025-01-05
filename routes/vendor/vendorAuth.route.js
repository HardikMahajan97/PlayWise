import express from 'express';
const router = express.Router({ mergeParams: true });
import VendorInfo from '../../models/vendor/vendorAuth.model.js';
import { signup, login, checkIDForVerification, sendOTP, verifyOTP, updateVendorInfo} from "../../controllers/vendor/vendorAuth.controller.js";

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

router
    .route("/update-vendor-info/:id")
    .post(updateVendorInfo);

export default router;
