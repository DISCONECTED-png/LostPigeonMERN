import notify from "../models/Notificationmodel.js";
import User from "../models/usermodel.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs" 

export const getuserprofile = async(req,res)=>{
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getuserprofile",error.message);
        res.status(500).json({error:error.message})
    }
}
export const followunfollowuser = async(req,res)=>{
    try {
        const {id} = req.params;
        const usertomodify = await User.findById(id);
        const currentuser = await User.findById(req.user._id);
        if(id === req.user._id.toString()){
            return res.status(400).json({error:"You can not follow or unfollow yourself"});
        }
        if(!usertomodify || !currentuser){
            return res.status(400).json({error:"User not found"});
        }
        const isfollowing = currentuser.following.includes(id);
        if(isfollowing){
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}})
            const newnotification = new notify({
                type:"follow",
                from:req.user._id,
                to:usertomodify._id
            })
            await newnotification.save();
            res.status(200).json({message:"User unfollowed successfully"})
        }
        else{
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}})
            const newnotification = new notify({
                type:"follow",
                from:req.user._id,
                to:usertomodify._id
            })
            await newnotification.save();
            res.status(200).json({message:"User followed successfully"})
        }
    } catch (error) {
        console.log("Error in getuserprofile",error.message);
        res.status(500).json({error:error.message})
    }
}
export const getsuggestedusers = async(req,res)=>{
    try {
        const userid = req.user._id;
        const userfollowedbyme = await User.findById(userid).select("following");
        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne:userid}
                }
            },
            {$sample:{size:10}}
        ])
        const filteredusers = users.filter((user)=>!userfollowedbyme.following.includes(user._id));
        const suggestedusers = filteredusers.slice(0,4)
        suggestedusers.forEach((user)=>{user.password = null})
        
        res.status(200).json(suggestedusers)
    } catch (error) {
        console.log("Error in suggested users",error.message);
        res.status(500).json({error:error.message})
    }
}
export const updateuser = async(req,res)=>{
    const {fullName,username,email,currentpassword,newpassword,bio,link} = req.body;
    let {profileimg,coverimg} = req.body;
    const userid = req.user._id;
    try {
        let user = await User.findById(userid);
        if(!user) return res.status(404).json({message:"User not found"})
        if((!newpassword && currentpassword) || (!currentpassword && newpassword)){
            return res.status(400).json({error:"Please provide both current and the new password"})
        }
        if(currentpassword && newpassword){
            const ismatch = await bcrypt.compare(currentpassword, user.password);
            if(!ismatch) return res.status(400).json({error:"Current password is incorrect"})
            if(newpassword.length <8){
                return res.status(400).json({error:"password must be of 8 characters"});
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newpassword,salt)
        }
        if(profileimg){
            if(user.profileimg){
                await cloudinary.uploader.destroy(user.profileimg.split("/").pop().split(".")[0])
            }
            const uploadimg = await cloudinary.uploader.upload(profileimg)
            profileimg = uploadimg.secure_url;
        }
        if(coverimg){
            if(user.coverimg){
                await cloudinary.uploader.destroy(user.coverimg.split("/").pop().split(".")[0])
            }
            const uploadimg = await cloudinary.uploader.upload(coverimg)
            coverimg = uploadimg.secure_url;
        }
        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileimg = profileimg || user.profileimg;
        user.coverimg = coverimg || user.coverimg;
        user = await user.save();
        user.password = null;
        return res.status(200).json(user)
    } catch (error) {
        console.log("Error in updating",error.message);
        res.status(500).json({error:error.message})
    }
}