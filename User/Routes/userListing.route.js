import express from 'express';
const router = express.Router({ mergeParams: true });
import {
    showAllListingsToTheUser,
    getOneParticularListing,
} from "../Controllers/userListing.controller.js";

router
    .route("/")
    .get(showAllListingsToTheUser);

router
    .route("/:hallId")
    .get(getOneParticularListing);

export default router;