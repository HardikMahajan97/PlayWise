import express from 'express';
const router = express.Router({ mergeParams: true });
import VendorInfo from '../Models/vendorAuth.model.js';
import {
    signup,
    login,
    updateVendorInfo,
    validateAndGenerateOtp,
    verifyOtp, deleteVendor,
    changePassword
} from "../Controllers/vendorAuth.controller.js";
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
    .route("/update-vendor-info/:id")
    .put(updateVendorInfo);

router
    .route("/delete/:id")
    .delete(deleteVendor)

router
    .route("/changePassword")
    .post(changePassword);
export default router;
