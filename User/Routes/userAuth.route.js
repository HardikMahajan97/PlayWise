import express from 'express';

const router = express.Router({mergeParams: true});
import {
    userSignup,
    userLogin,
    updateUserInfo,
    validateAndGenerateOtp,
    verifyOtp,
    changePassword
} from "../Controllers/userAuth.controller.js";
import passport from "passport";
import {login} from "../../Vendor/Controllers/vendorAuth.controller.js";

router
    .route("/signup")
    .post(userSignup);

router
    .route("/login", passport.authenticate('user-local', {
        failureRedirect: userLogin,
        failureMessage: true
    }))
    .post(userLogin);

//User info update
router
    .route("/update/:id")
    .post(updateUserInfo)

router
    .route("/forgotPassword")
    .post(validateAndGenerateOtp)

router
    .route("/verify")
    .post(verifyOtp)
router
    .route("/changePassword")
    .post(changePassword);

export default router;