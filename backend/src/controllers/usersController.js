import User from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRETM, {
        expiresIn: "30d",
    });
};


export const registerUser = async (req, res) => {
    try{
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await user.findOne({email});

    if (userExists){
        return res.status(400).json({message: "Email already Exist"});
    }

    const user = await User.create({name, email, password});

    res.status(201).json ({
        message: "User registered successfully",
        token: generateToken(user._id),
        user,
    });

    } catch (error) {
        res.status(501).json({message: error.message});
    }
};


//login

export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        const user =  await User.findOne({email});
        if(!user) return res.status(400).json({message: "Invalid Credentials"}); 

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({message: "Invalid Credentials"});

        res.status(200).json({
            message: "Seccessful Login",
            token: generateToken(user._id),
            user,
        })
    } catch (error){
        res.status(501).json({message:error.message});
    }
};


