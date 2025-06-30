import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({
    name:{
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

userSchema.plugin(passportLocalMongoose, {
    usernameField : 'username',
    hashField:'hash',
    saltField:'salt'
});
const User = mongoose.model("User", userSchema);
export default User;