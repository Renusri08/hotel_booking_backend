export const isOwner=(req,res,next)=>{
    try{
        if(req.user.role==="owner"){
            next();
        }
        else{
            return res.status(401).json({message:"Unauthorized",success:false});
        }
    }
    catch(error){
        return res.status(500).json({message:"Unauthorized",success:false});
    }
};