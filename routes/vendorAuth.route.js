import express from 'express';
const router = express.Router({ mergeParams: true });
import VendorInfo from '../models/vendorAuth.model.js';
import {
    signup,
    login,
    updateVendorInfo,
    validateAndGenerateOtp,
    verifyOtp, deleteVendor,
    changePassword,
    deleteAllVendors
} from "../controllers/vendorAuth.controller.js";
import passport from "passport";

router
    .route("/signup")
    .post(signup);

router
    .route("/login", passport.authenticate('vendor-local', {
        failureRedirect: login,
        failureMessage: true
    }))
    .post(login);

router
    .post("/forgotPassword", validateAndGenerateOtp);

router
    .route("/verify")
    .post(verifyOtp)

router
    .route("/update-vendor-info/:vendorId")
    .put(updateVendorInfo);

router
    .route("/delete/:vendorId")
    .delete(deleteVendor)

router
    .route("/changePassword")
    .post(changePassword);

router
    .route("/deleteAllVendors")
    .get(deleteAllVendors);
export default router;
