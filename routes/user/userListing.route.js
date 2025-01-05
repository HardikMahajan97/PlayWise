import express from 'express';
const router = express.Router({ mergeParams: true });
import {showAllListingsToTheUser, getOneParticularListing} from "../../controllers/user/userListing.controller.js";

router
    .route("/")
    .get(showAllListingsToTheUser);

router
    .route("/:id")
    .get(getOneParticularListing);


export default router;