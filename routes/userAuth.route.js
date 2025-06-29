import express from 'express';

const router = express.Router({mergeParams: true});
import {
    userSignup,
    userLogin,
    updateUserInfo,
    validateAndGenerateOtp,
    verifyOtp,
    changePassword,
    deleteAllUsers
} from "../controllers/userAuth.controller.js";
import passport from "passport";
import {login} from "../controllers/vendorAuth.controller.js";

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
    .route("/update/:userId")
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

router
    .route("/deleteAllUsers")
    .get(deleteAllUsers);
export default router;