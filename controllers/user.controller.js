import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
    console.log("Signup controller called", req.body);

    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.json({ message: "All fields are required", success: false });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: "User already exists", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        // ✅ Send success response after saving
        return res.json({
            message: "User registered successfully",
            success: true,
            user: { name, email, role }  // Optionally send back useful user info
        });
    } catch (error) {
        console.error(error);
        return res.json({ message: "Internal server error", success: false });
    }
};

//login function
export const login =async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.json({message:"all fields are required",success:false});
        }

        const user=await User.findOne({email});
        if(!user){
            return res.json({message:"user not found",success:false});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({message:"invalid password",success:false});
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );
        

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:24*60*60*1000,
            secure:"true",
            sameSite:"none"
        });

        return res.json({message:"login successful",success:true,user});
    }

    catch(error){
        console.error("Login controller error:", error); 
        return res.json({message:"internal server error",success:false})
    }

};


//logout function

export const logout=async(req,res)=>{
    try{
        res.clearCookie("token");
        return res.json({message:"logout succesful",success:true});
    }
    catch(error){
        return res.json({message:"internal server error",success:false});
    }
};


//is-auth function

export const isAuth = async (req, res) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        return res.json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ message: "internal server error", success: false });
    }
};



