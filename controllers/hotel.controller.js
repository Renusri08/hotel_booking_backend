import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";


export const registerHotel=async(req,res)=>{
    const {id} =req.user;
    try{
        const {hotelName,hotelAddress,rating,price,amenities}=req.body;
        const image=req.file.filename;
        if(
            !hotelName||
            !hotelAddress ||
            !rating ||
            !price ||
            !amenities ||
            !image
        ){
            return res.status(400).json({message:"All fiels are required",success:false});
        }
        const newHotel=new Hotel({
            hotelName,
            hotelAddress,
            rating,
            price,
            amenities,
            image,
            owner:id,
        });
        await newHotel.save();
        return res.status(201).json({message:"Hotel registered successfully",success:true});
    }
    catch(error){
        console.log(error);
        return res.status(500).json({message:"Internal server error"});
    }
};

//get owner hotels

export const getOwnerHotels=async(req,res)=>{
    const {id}=req.user;
    try{
        const hotels=await Hotel.find({owner:id}).populate("owner","name  email");
        return res.status(200).json({hotels,success:true});
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
}


//get all hotels
export const getAllHotels=async(req,res)=>{
    try{
        const hotels=await Hotel.find().populate("owner","name email");
        return res.status(200).json({hotels,success:true});
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
}


//delete hotel


export const deleteHotel=async(req,res)=>{
    try{
        const {hotelId}=req.params;
        const deletedRoom=await Hotel.findByIdAndDelete(hotelId);
        if(!deletedRoom){
            return res.status(404).json({success:false,message:"hotel not found"});
        }
        await Room.deleteMany({ hotel: hotelId });
        res.status(200).json({success:true,message:"hotel deleted successfully"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }
}