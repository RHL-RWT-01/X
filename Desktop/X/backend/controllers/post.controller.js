import Notification from "../models/notification.js";
import Post from "../models/post.js";
import User from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && !img)
      return res.status(400).json({ message: "Post can't be empty" });

    if (img) {
      const uploadedPicture = await cloudinary.uploader.upload(img);
      img = uploadedPicture.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (e) {
    console.log("Error createPost controller ", e.message);
    res.status(404).json({ Error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "You can delete only your posts" });
    }
    if (post.img) {
      const imageID = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageID);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (e) {
    console.log("Error deletePost controller ", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({ message: "Comment can't be empty" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = {
      user: userId,
      text,
    };
    post.comments.push(newComment);
    await post.save();
    res.status(200).json(post);
  } catch (e) {
    console.log("Error commentOnPost controller ", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    // Ensure postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Convert both to string to avoid mismatch issues
    const userLikedPost = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (userLikedPost) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      // Fetch updated likes directly from the database
      const updatedPost = await Post.findById(postId);
      res.status(200).json(updatedPost.likes);
    } else {
      // Like the post
      await Post.updateOne({ _id: postId }, { $addToSet: { likes: userId } }); // Ensures unique values
      await User.updateOne(
        { _id: userId },
        { $addToSet: { likedPosts: postId } }
      );

      // Send notification only if the post has an owner
      if (post.user) {
        const notification = new Notification({
          from: userId,
          to: post.user,
          type: "like",
        });
        await notification.save();
      }

      // Fetch updated likes directly from the database
      const updatedPost = await Post.findById(postId);
      res.status(200).json(updatedPost.likes);
    }
  } catch (e) {
    console.error("Error in likeUnlikePost controller:", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (e) {
    console.log("Error getAllPosts controller ", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(likedPosts);
  } catch (e) {
    console.log("Error getLikedPosts controller ", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const following = user.following;
    const followingPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(followingPosts);
  } catch (e) {
    console.log("Error getFollowingPosts controller ", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(userPosts);
  } catch (e) {
    console.log("Error getUserPosts controller ", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
