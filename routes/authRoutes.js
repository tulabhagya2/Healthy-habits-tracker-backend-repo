const express=require("express");
const _route=express.Router();
const {signup,login}=require("../controllers/authController");

_route.post("/signup",signup);
_route.post("/login",login);


module.exports=_route;