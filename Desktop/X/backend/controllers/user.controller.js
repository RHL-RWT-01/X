import User from "../models/user.js";

export const getUserProfile = async (req, res, next) => {
    const {usernam}=req.params;
    try {
        const user = await User.findOne({username}).
        select("-password");
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};

export const followUnfollow = async (req, res, next) => {
    try{
        const {id}=req.params;
        const userTomodify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id===req.user._id.toString()){
            return res.status(400).json({message: "You cannot follow yourself"});
        }
        if(!userTomodify || !currentUser){
            return res.status(404).json({message: "User not found"});
        }
        const isFollowing = currentUser.following.includes(id);
        if(isFollowing){
            await User.findByIdAndUpdate(id,{$pull: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$pull: {following: id}});
            res.status(200).json({message: "User unfollowed successfully"});
        }else{
            await User.findByIdAndUpdate(id,{$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$push: {following: id}});
            res.status(200).json({message: "User followed successfully"});
        }
    }catch (e){
        console.log("Error in followUnfollow controller", e.message);
        res.status(500).json({error: "Internal server error"});
    }
};