import User from '../models/usermodel.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generatetoken.js';
export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;
        console.log("Signup request body:", req.body);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingUser = await User.findOne({ username });
        console.log("Existing User:", existingUser);
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        const existingEmail = await User.findOne({ email });
        console.log("Existing Email:", existingEmail);
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        console.log("Generated Salt:", salt);
        const hashedpassword = await bcrypt.hash(password, salt);
        console.log("Hashed password:", hashedpassword);

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedpassword,
        });
        console.log("New User Object:", newUser);

        generateTokenAndSetCookie(newUser._id, res);

        await newUser.save();
        console.log("User saved successfully");

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profileimg: newUser.profileimg,
            coverimg: newUser.coverimg,
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileimg: user.profileimg,
            coverimg: user.coverimg,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("Internal server error",error.message)
    }
};

export const getMe = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}