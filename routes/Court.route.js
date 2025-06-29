import express from "express";

const router = express.Router({mergedParams: true});
import {
    createCourt,
    updateCourt,
    deleteCourt,
    getCourtById,
    getAllCourts,
    setAvailability,
    updateAvailability
} from "../controllers/Court.controller.js";

router.route('/courts').post(createCourt);
router.route('/courts/:courtId')
    .put(updateCourt)
    .delete(deleteCourt)
    .get(getCourtById);
router.route('/get-all-courts').get(getAllCourts);

router.route('/courts/:courtId/availability').post(setAvailability);
router.route('/courts/:courtId/availability/update')
    .put(updateAvailability);

export default router;