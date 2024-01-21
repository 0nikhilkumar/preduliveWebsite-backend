import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    name: {
        type: String
    },
    phone: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    cpassword: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return null;
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
    }, process.env.ACCESS_SECRET_TOKEN, 
    {
        expiresIn: process.env.ACCESS_SECRET_EXPIRY
    });
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_SECRET_TOKEN, 
    {
        expiresIn: process.env.REFRESH_SECRET_EXPIRY
    });
}

export const User = mongoose.model("User", userSchema);