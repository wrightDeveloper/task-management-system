import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new  mongoose.Schema({
    name: {type: string, required: true},
    email: {type: string, required: true, unique: true, lowercase: true, trim: true},
    password: {type:string, required:true, minlength: 6},
    role: {type: string, required: true},
    isAdmin: {type: Boolean, required: true, default: false},
    isActive: {type: Boolean, required: true, default: true},
}, {timestamp: true}
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10)
    this.password =  await bcrypt.hash(this.password, salt);

    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;