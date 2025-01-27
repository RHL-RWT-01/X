import Notification from "../models/notification.js";
import User from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";

export const getUserProfile = async (req, res, next) => {
  const  username  = req.params;
  try {
    const user = await User.findOne(username).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const followUnfollow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userTomodify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    if (!userTomodify || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      const newNotifications = new Notification({
        type: "follow",
        from: req.user._id,
        to: userTomodify._id,
      });
      await newNotifications.save();
      // TODO: we should send a notification to the user who is being followed?
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (e) {
    console.log("Error in followUnfollow controller", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: userId,
          },
        },
      },
      { $sample: { size: 5 } },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => {
      user.password = null;
    });
    res.status(200).json(suggestedUsers);
  } catch (e) {
    console.log("Error in getSuggestions controller", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res, next) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profilePicture, coverPicture } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ message: "Please enter current password and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid current password" });
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profilePicture) {
      if (user.profilePicture) {
        await cloudinary.uploader.destroy(
          user.profilePicture.split("/").pop().split(".")[0]
        );
      }
      const uploadedPicture = await cloudinary.uploader.upload(profilePicture);
      profilePicture = uploadedPicture.secure_url;
    }
    if (coverPicture) {
      if (user.coverPicture) {
        await cloudinary.uploader.destroy(
          user.coverPicture.split("/").pop().split(".")[0]
        );
      }
      const uploadedPicture = await cloudinary.uploader.upload(coverPicture);
      coverPicture = uploadedPicture.secure_url;
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profilePicture = profilePicture || user.profilePicture;
    user.coverPicture = coverPicture || user.coverPicture;
    await user.save();
    user.password = null; // remove password from response
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (e) {
    console.log("Error in updateProfile controller", e.message);
    res.status(500).json({ error: "Internal server error", err: e.message });
  }
};
