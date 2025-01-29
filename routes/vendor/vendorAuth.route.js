import express from 'express';
const router = express.Router({ mergeParams: true });
import VendorInfo from '../../models/vendor/vendorAuth.model.js';
import {
    signup,
    login,
    updateVendorInfo,
    validateAndGenerateOtp,
    verifyOtp, deleteVendor,
    changePassword
} from "../../controllers/vendor/vendorAuth.controller.js";

router
    .route("/signup")
    .post(signup);

router
    .route("/login")
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
