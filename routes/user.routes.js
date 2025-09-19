import express from "express";
import {login,logout,signup,isAuth} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const userRouter=express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.get("/is-auth",isAuthenticated,isAuth);
userRouter.get("/logout",isAuthenticated,logout);

export default userRouter;