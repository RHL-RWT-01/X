import express from "express";
const router = express.Router();

router.get('/signup',(req,res)=>{
    res.json({
        "data":"Signup EndPonint",
    });
});

router.get('/login',(req,res)=>{
    res.json({
        "data":"login EndPonint",
    });
});

router.get('/logout',(req,res)=>{
    res.json({
        "data":"logout EndPonint",
    });
});

export default router;