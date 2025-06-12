import express from "express";
import path from "path";
import dotenv from "dotenv";
import authroutes from "./routes/auth.routes.js"
import userroutes from "./routes/user.router.js"
import postroutes from "./routes/post.routes.js"
import notificationroutes from "./routes/notification.routes.js"
import connectmongodb from "./db/connectmongodb.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
const __dirname = path.resolve()
const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/api/auth",authroutes);
app.use("/api/users",userroutes);
app.use("/api/posts",postroutes);
app.use("/api/notifications",notificationroutes);
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("/{*any}", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}
app.listen(PORT,()=>{
    console.log(`server running on ${PORT} `)
    connectmongodb()
})
