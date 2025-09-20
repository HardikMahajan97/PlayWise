import express from 'express';
import dotenv from "dotenv";
import BadmintonHall from '../models/BadmintonHall.model.js';
import Court from '../models/Court.model.js';
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
        const listings = await BadmintonHall.aggregate([
            // Join with courts
            {
                $lookup: {
                    from: "courts", // collection name (plural)
                    localField: "_id",
                    foreignField: "hallId",
                    as: "courts"
                }
            },
            // Join with vendors
            {
                $lookup: {
                    from: "vendorinfos", // collection name (lowercase plural of model)
                    localField: "vendorId",
                    foreignField: "_id",
                    as: "vendor"
                }
            },
            {
                $unwind: "$vendor" // convert vendor array to object
            },
            {
                $project: {
                    name: 1,
                    city: 1,
                    address: 1,
                    pincode: 1,
                    state: 1,
                    image: 1,
                    numberOfCourts: 1,
                    amenities: 1,
                    additionalInfo: 1,
                    pricePerHour: 1,
                    matType: 1,
                    courts: {
                        $map: {
                            input: "$courts",
                            as: "court",
                            in: {
                                _id: "$$court._id",
                                number: "$$court.number",
                            }
                        }
                    },
                    vendor: {
                        _id: "$vendor._id",
                        name: "$vendor.name",
                        email: "$vendor.email",
                        contact: "$vendor.contact"
                    }
                }
            }
        ]);
        const responseObject = listings.map(hall => {
            return {
                hallId: hall._id,
                hallName: hall.name,
                address: hall.address,
                city: hall.city,
                state: hall.state,
                pincode: hall.pincode,
                image: hall.image,
                numberOfCourts: hall.numberOfCourts,
                amenities: hall.amenities,
                additionalInfo: hall.additionalInfo,
                pricePerHour: hall.pricePerHour,
                matType: hall.matType,

                vendorId: hall.vendor._id,
                vendorName: hall.vendor.name,
                vendorEmail: hall.vendor.email,
                vendorContact: hall.vendor.contact,
            };
        });


        console.log(`Found ${listings.length} halls`);

        return res.status(200).json({
            success: true,
            totalHalls,
            currentPage: page,
            totalPages: Math.ceil(totalHalls / limit),
            halls: responseObject
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

export const getOneParticularListing = async(req, res) => {
    try{
        const {userId, hallId}= req.params;
        console.log("Reached the function");
        const hall = await BadmintonHall.findById(hallId)
            .populate({path:'vendorId', select:'name email contact'}) //Instead of giving vendorId, it will give me the
            //information of the vendor. If it is getting difficult to understand ask out on Google.
            .exec(); //Executes
        const courts = await Court.find({hallId: hall});
        console.log("Sending your hall!");

        return res.status(200).json({success: true, data: {hall, courts}});

    } catch(e){
        console.log(e.message);
        return res.status(500).json({ success: false, message:"Internal Server Error", error: e.message });
    }
}


