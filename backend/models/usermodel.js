import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    fullName:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
        minLength: 8,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default: []
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default: []
    }],
    profileimg:{
        type:String,
        default:""
    },
    coverimg:{
        type:String,
        default:""
    },
    bio:{
        type:String,
        default:""
    },
    link:{
        type:String,
        default:""
    },
    likedposts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[],
        }
    ]
},{timestamps:true});

const User = mongoose.model("User",userschema);
export default User;