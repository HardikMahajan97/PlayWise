import express from 'express';
const router = express.Router({ mergeParams: true });
import {showAllListingsToTheUser,
    getOneParticularListing,
    bookThisListing
} from "../../controllers/user/userListing.controller.js";

router
    .route("/")
    .get(showAllListingsToTheUser);

router
    .route("/:hallId")
    .get(getOneParticularListing);

router
    .route("/book/:hallId")
    .post(bookThisListing);


export default router;