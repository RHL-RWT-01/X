import { generateTokenAndCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    const isUserExist = await User.findOne({ username });

    if (isUserExist) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({
        message: "Email already taken",
      });
    }

    if (password.length < 5) {
      res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash password for better security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profilePicture: newUser.profilePicture,
        coverPicture: newUser.coverPicture,
      });
    } else {
      res.status(500).json({
        message: "Failed to create user",
      });
    }
  } catch (e) {
    console.log("Error in signup controller", e.message);
    res.status(500).json({
      error: "Error in signup controller",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    generateTokenAndCookie(user._id, res);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
    });
  } catch (e) {
    console.log("Error in signup controller", e.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (e) {
    console.log("Error in Logout controller", e.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);  
    }catch(e){
        console.log("Error in getMe controller", e.message);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};