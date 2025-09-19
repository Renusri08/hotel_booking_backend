import Booking from "../models/booking.model.js";
import Room from "../models/room.model.js";
import Hotel from "../models/hotel.model.js";
import User from "../models/user.model.js";


export const checkAvailability=async(room,checkInDate,checkOutDate)=>{
    try{
        const booking =await Booking.find({room:room._id,checkInDate:{$lte:checkOutDate},checkOutDate:{$gte:checkInDate}});
        const isAvailable=booking.length==0;
        return isAvailable;
    }
    catch(error){
        console.log("error",error);
    }
}

export const checkRoomAvailabity=async(req,res)=>{
    try{
        const {room,checkInDate,checkOutDate}=req.body;
        const isAvailable=await checkAvailability({room,checkInDate,checkOutDate});
        res.json({success:true,isAvailable});
    }
    catch(error){
        res.status(500).json({message:"Internal server error"});
    }
}


export const bookRoom=async(req,res)=>{
    try{
        const {id}=req.user;
        const user=await User.findById(id);
        const {room,checkInDate,checkOutDate,persons,paymentMethod}=req.body;
        const isAvailable=await checkAvailability({room,checkInDate,checkOutDate});
        if(!isAvailable){
            return res.status(400).json({message:"Room is not available",success:false});
        }
        const roomData=await Room.findById(room).populate("hotel");
        let totalPrice=roomData.pricePerNight;

        const checkIn=new Date(checkInDate);
        const checkOut=new Date(checkOutDate);
        const timeDiff=checkOut.getTime()-checkIn.getTime();
        const nights=Math.ceil(timeDiff/(1000*3600*24));
        totalPrice=totalPrice*nights*persons;

        const booking=await Booking.create({
            user:id,
            room,
            hotel:roomData.hotel._id,
            checkIn,
            checkOut,
            persons,
            totalPrice,
            paymentMethod
        });
       
        
        res.json({success:true,message:"Room Booked successfully"});
    }
    catch(error){
        res.status(500).json({message:"Internal server error"});
    }
}

export const getUserBookings=async(req,res)=>{
    try{
        const {id}=req.user;
        const bookings = await Booking.find({ user: id }).populate("hotel").populate("room").sort({createdAt:-1});


        res.json({success:true,bookings});
    }
    catch(error){
        res.statu(500).json({message:"Internal server error"});
    }
}


export const getHotelBookings=async(req,res)=>{
    try{
        const {id}=req.user;
        const hotels=await Hotel.find({owner:id}).select("_id");
        if(!hotels){
            return res.status(404).json({message:"Hotels not found",success:false});
        }
        const hotelId=hotels.map((hotel)=>hotel._id);

        const bookings=await Booking.find({hotel:{$in:hotelId}}).populate("hotel").populate("room").sort({createdAt:-1});
        if(bookings.length==0){
            return res.status(404).json({message:"Bookings not found",success:false});
        }
        else{
            res.json({success:true,bookings})
        }
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}


{/*export const stripePayment=async(req,res)=>{
    try{
        const {bookingId}=req.body;
        const booking=await Booking.findById(bookingId);
        const roomData=await Room.findById(booking.room).populate("hotel");
        const totalPrice=booking.totalPrice;
        const {origin}=req.headers;

        const stripeInstance=stripe(process.env.STRIPE_SECRET_KEY);
        const line_items=[
            {
                price_data:{
                    currency:"usd",
                    product_data:{
                        name:roomData.hotel.hotelName,
                    },
                    unit_amount:totalPrice*100,
                },
                quantity:1,
            },
        ];
        const session=await stripeInstance.checkout.sessions.create({
            line_items,
            mode:"payment",
            success_url:`${origin}/loader/my-bookings`,
            cancel_url:`${origin}/my-bookings`,
            metadata:{
                bookingId,
            },
        });
        await booking.updateOne({isPaid:true,status:"confirmed"});
        res.json({success:true,url:session.url})
     
    }
    catch(error){
            console.log("error",error);
            res.status(500).json({message:"Internal server error"});
    }
}*/}


