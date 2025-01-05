import express from 'express';

const router = express.Router({mergeParams: true});
import {
    userSignup,
    userLogin,
    updateUserInfo,
    renderValidationForm, validateAndGenerateOtp,
    renderOtpForm, verifyOtpAndSendPasswordOnContact
} from "../../controllers/user/userAuth.controller.js";

router
    .route("/signup")
    .post(userSignup);

router
    .route("/login")
    .post(userLogin);

//testing only
// router
//     .route("/:id")
//     .get(just);

//User info update
router
    .route("/update/:id")
    .post(updateUserInfo)

router
    .route("/forgotPassword/:id")
    .get(renderValidationForm)
    .post(validateAndGenerateOtp)
    // .post(forgotPasswordRouteForUser)
router
    .route("/verify")
    .get(renderOtpForm)
    .post(verifyOtpAndSendPasswordOnContact)

export default router;