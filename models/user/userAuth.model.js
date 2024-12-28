import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({
    Name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    contact:{
        type:Number,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    }
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
export default User;