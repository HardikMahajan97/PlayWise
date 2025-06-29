import express from 'express';

const router = express.Router({mergeParams: true});
import {showAllHalls, showHall, createHall, updateHall, deleteHall} from "../Controllers/hall.controller.js";
//All the halls
router
    .route("/")
    .get(showAllHalls);

//Get one Hall
router
    .route("/:id")
    .get(showHall);

//Create a Hall
router
    .route("/create-court")
    .post(createHall);

//Update a Hall
router
    .route("/hall/update/:id")
    .put(updateHall);

//Delete a Hall
router
    .route("/deletelisting/:id")
    .delete(deleteHall);

export default router;