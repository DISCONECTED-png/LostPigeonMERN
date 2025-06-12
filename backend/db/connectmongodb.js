import mongoose from "mongoose";
const connectmongodb = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongo URI is connected:${conn.connection.host}`)
    } catch (error) {
        console.error(`Error in connecting with mongoDB:${error.message}`)
    }
}
export default connectmongodb;