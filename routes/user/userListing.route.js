import express from 'express';
const router = express.Router({ mergeParams: true });
import {showAllListingsToTheUser} from "../../controllers/user/userListing.controller.js";

router
    .route("/")
    .get(showAllListingsToTheUser);


export default router;