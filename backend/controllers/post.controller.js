import User from "../models/usermodel.js";
import Post from "../models/postmodel.js";
import { v2 as cloudinary } from "cloudinary";
import notify from "../models/Notificationmodel.js";

export const createpost = async(req,res)=>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userid = req.user._id.toString();
        const user = await User.findById(userid);
        if(!user) return res.status(404).json({error:"User not found"});
        if(!text && !img){
            res.status(404).json({error:"Post cant be created without an image or some text"});
        }
        if(img){
            const uploadimg = await cloudinary.uploader.upload(img)
            img = uploadimg.secure_url;
        }
        const newpost = new Post({
            user:userid,
            text,
            img
        })
        await newpost.save()
        res.status(201).json(newpost)
    } catch (error) {
        console.log("Error in posting",error.message);
        res.status(500).json({error:error.message})
    }
}
export const likepost = async (req, res) => {
    try {
        const userid = req.user._id;
        const { id: postid } = req.params;
        const post = await Post.findById(postid);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userlikedpost = post.likes.includes(userid);

        if (userlikedpost) {
            // Unlike the post
            await Post.updateOne({ _id: postid }, { $pull: { likes: userid } });
            await User.updateOne({_id:userid},{$pull:{likedposts:postid}})

            // Fetch the updated post to get the correct likes array
            const updatedPost = await Post.findById(postid);
            const updatedlikes = updatedPost.likes;

            res.status(200).json(updatedlikes);
        } else {
            // Like the post
            post.likes.push(userid);
            await User.updateOne({_id:userid},{$push:{likedposts:postid}})
            await post.save(); // Add await here

            const notification = new notify({
                from: userid,
                to: post.user,
                type: "like"
            });
            await notification.save();

            res.status(200).json(post.likes);
        }
    } catch (error) {
        console.log("Error in Liking", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const commentpost = async(req,res)=>{
    try {
        const {text} = req.body;
        const postid = req.params.id;
        const userid = req.user._id;
        if(!text){
            return res.status(400).json({error:"Text field is empty"})
        }
        const post = await Post.findById(postid) 
        if(!post){
            return res.status(400).json({error:"Post not found"})
        }
        const comment = {user: userid,text}
        post.comments.push(comment);
        await post.save();
        return res.status(200).json(post)
    } catch (error) {
        console.log("Error in Commenting",error.message);
        res.status(500).json({error:error.message})
    }
}
export const deletepost = async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({error:"Post not found"})
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error:"Not authorised to delete this file"})
        }
        if(post.img){
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0])
        }
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({message:"Post deleted successfully"})
    } catch (error) {
        console.log("Error in deleting post",error.message);
        res.status(500).json({error:error.message})
    }
}
export const getallpost = async(req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        })
        if(posts.length ===0){
            return res.status(200).json([])
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log("Internal Server Error",error.message);
        res.status(500).json({error:error.message})
    }
}
export const getlikedposts = async(req,res)=>{
    const userid = req.params.id;
    try {
        const user = await User.findById(userid);
        if(!user) return res.status(404).json({error:"User not found"})
        const likedposts = await Post.find({_id:{$in:user.likedposts}}).populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        })
        res.status(200).json(likedposts);
    } catch (error) {
        console.log("Internal Server Error",error.message);
        res.status(500).json({error:error.message})
    }
}
export const getfollowingposts = async(req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const following = user.following;
        const feedposts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password" 
            })
            .populate({
                path: "comments.user",
                select: "-password" 
            });
        
        res.status(200).json(feedposts);
    } catch (error) {
        console.error("Internal Server Error:", error.message); 
        res.status(500).json({ error: error.message });
    }
    
}
export const getuserposts = async(req,res)=>{
    try {
        const {username} = req.params;
        const user = await User.findOne({username})
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password" 
            })
            .populate({
                path: "comments.user",
                select: "-password" 
            });
        res.status(200).json(posts);
    } catch (error) {
        console.error("Internal Server Error:", error.message); 
        res.status(500).json({ error: error.message });
    }
}