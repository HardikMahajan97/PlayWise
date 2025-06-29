import express from 'express';
import dotenv from "dotenv";
import BadmintonHall from '../models/BadmintonHall.model.js';
const app = express();
dotenv.config();

export const showAllListingsToTheUser = async (req, res) => {
    try {
        console.log("Fetching all listings...");

        // Add basic pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        // First check if there are any halls
        const totalHalls = await BadmintonHall.countDocuments();
        
        if (totalHalls === 0) {
            return res.status(404).json({
                success: false,
                message: "No badminton halls available"
            });
        }

        // Fetch halls with pagination
        const listings = await BadmintonHall.find({})
            .populate({
                path: 'vendorId',
                select: 'Name email contact' // Only select necessary fields
            })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        console.log(`Found ${listings.length} halls`);

        return res.status(200).json({
            success: true,
            totalHalls,
            currentPage: page,
            totalPages: Math.ceil(totalHalls / limit),
            halls: listings
        });

    } catch (error) {
        console.error("Error in showAllListingsToTheUser:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching badminton halls",
            error: error.message
        });
    }
};
// export const showAllListingsToTheUser = async (req, res) => {
//     try {
//         console.log("Fetching all listings...");
//
//         const listings = await BadmintonHall.find({})
//             .populate({path:'vendorId', select:'Name email contact'}) //Instead of giving vendorId, it will give me the
//             //information of the vendor. If it is getting difficult to understand ask out on Google.
//             .exec(); //Executes
//
//         console.log("Fetched listings");
//         return res.status(200).json(listings);
//     } catch (e) {
//         console.error("Error fetching listings:", e);
//         return res.status(500).json({ success: false, message: "Internal Server Error", error: e.message });
//     }
// };

export const getOneParticularListing = async(req, res) => {
    try{
        const {userId, hallId}= req.params;
        console.log("Reached the function");
        const listing = await BadmintonHall.findById(hallId)
            .populate({path:'vendorId', select:'Name email contact'}) //Instead of giving vendorId, it will give me the
            //information of the vendor. If it is getting difficult to understand ask out on Google.
            .exec(); //Executes
        console.log("Sending your hall!");

        return res.status(200).json({success: true, data: {listing, userId, hallId}});

    } catch(e){
        console.log(e.message);
        return res.status(500).json({ success: false, message:"Internal Server Error", error: e.message });
    }
}


