const asyncHandler=(requestHandler)=>{
    // console.log("hello");
   return  (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler};

