import Post from "../models/post.js";
import User from "../models/user.js";
import {v2 as cloudinary} from "cloudinary";
export const createPost = async(req,res)=>{
    try {
        const {text}=req.body;
        let {img}=req.body;
        const userId=req.user._id.toString();
        const user = await User.findById(userId);
        if(!user)return res.status(404).json({message:"User not found"});

        if(!text && !img)return res.status(400).json({message:"Post can't be empty"});

        if(img){
            const uploadedPicture = await cloudinary.uploader.upload(img);
            img = uploadedPicture.secure_url;
        }

        const newPost = new Post({
            user:userId,
            text,
            img
        })
        await newPost.save();
        res.status(201).json(newPost);
    }catch(e){
        res.status(404).json({Error:"Internal server error"});
        console.log("Error createPost controller ",e.message);
    }
}