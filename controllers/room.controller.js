import Room from "../models/room.model.js";

export const addRoom=async(req,res)=>{
    try{
        const{
            roomType,
            hotel,
            pricePerNight,
            description,
            amenities,
            isAvailable
        }=req.body;
        const image=req.files?.map((file)=>file.filename);
        const  newRoom=await Room.create({
            roomType,
            hotel,
            pricePerNight,
            description,
            amenities,
            isAvailable,
            images:image,
        })
        return res.status(201).json({message:"Room added successfully",success:true})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}


//get all rooms of a specific owner

export const getOwnerRooms=async(req,res)=>{
    
    try{
        const {id}=req.user;
        const ownerRooms = await Room.find()
        .populate({
            path: "hotel",
            match: { owner: id },
            select: "hotelName hotelAddress rating amenities owner",
        })
        .then(rooms => rooms.filter(room => room.hotel !== null));
        return res.status(200).json({ownerRooms,success:true});
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
}

//get all rooms

export const getAllRooms=async(Req,res)=>{
    try{
        const rooms=await Room.find().populate({
            path:"hotel",
            select:"hotelName hotelAddress amenities raitng owner",
            populate:{
                path:"owner",
                select:"name email",
            }
        }).exec();
        res.json({success:true,rooms});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }
}


//delete room
export const deleteRoom=async(req,res)=>{
    try{
        const {roomId}=req.params;
        const deletedRoom=await Room.findByIdAndDelete(roomId);
        if(!deletedRoom){
            return res.status(404).json({success:false,message:"Room not found"});
        }
        res.json({success:true,message:"Room deleted successfully"});
    }
    catch(error){
        console.error(error);
        res.status(500).json({message:"Internal server error"});
    }
}
