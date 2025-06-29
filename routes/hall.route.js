import express from 'express';

const router = express.Router({mergeParams: true});
import {showAllHalls, showHall, createHall, updateHall, deleteHall} from "../controllers/hall.controller.js";
//All the halls
router
    .route("/")
    .get(showAllHalls);

//Get one Hall
router
    .route("/:hallId")
    .get(showHall);

//Create a Hall
router
    .route("/create-hall")
    .post(createHall);

//Update a Hall
router
    .route("/hall/update/:hallId")
    .put(updateHall);

//Delete a Hall
router
    .route("/delete-hall/:hallId")
    .delete(deleteHall);

export default router;