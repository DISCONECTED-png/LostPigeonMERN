import mongoose from "mongoose";
const notificationschema = new mongoose.Schema(
    {
        from:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        to:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        type:{
            type:String,
            required:true,
            enum:["follow","like"],
        },
        read:{
            type:Boolean,
            default:false
        },
    },
    {timestamps:true}
);
const notify = mongoose.model("Notification",notificationschema);
export default notify;