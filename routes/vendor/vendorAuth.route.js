import express from 'express';
const router = express.Router({ mergeParams: true });
import VendorInfo from '../../models/vendor/vendorAuth.model.js';
import {
    signup,
    login,
    updateVendorInfo,
    validateAndGenerateOtp,
    verifyOtpAndSendPasswordOnContact, deleteVendor
} from "../../controllers/vendor/vendorAuth.controller.js";

router
    .route("/signup")
    .post(signup);

router
    .route("/login")
    .post(login);

router
    .get("/forgotPassword/:id", validateAndGenerateOtp);

router
    .route("/verify")
    .post(verifyOtpAndSendPasswordOnContact)

router
    .route("/update-vendor-info/:id")
    .put(updateVendorInfo);

router
    .route("/delete/:id")
    .delete(deleteVendor)

export default router;
