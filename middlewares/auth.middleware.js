import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import  User  from "../models/User.js";
import { apiError } from "../utils/apiError.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //for the access of  all the cookies
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    //  console.log(token);
    if (!token) {
      apiError(res, 401, false, "unauthorized request");
      return;
    }
    const decodedToken = jwt
      .verify(token, process.env.ACCESS_TOKEN_SECRET)


    const user = await User.findById(decodedToken?._id)
      .select("-password -refreshToken")


    if (!user) {
      //todo: discuss about frontend
      apiError(res, 401, false, "invalid access token");
      return;
    }
    //  set the object user 
    req.user = user;
    next();

  } catch (error) {
    apiError(res, 401, false, error?.message || "invalid access token");
    return;
  }

});
