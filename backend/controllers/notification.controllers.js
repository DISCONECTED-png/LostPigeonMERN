import notify from "../models/Notificationmodel.js";

export const getnotification = async(req,res)=>{
try {
    const userid = req.user._id;
    const notification = await notify.find({to:userid}).populate({
        path:"from",
        select:"username profileimg"
    });
    await notify.updateMany({to:userid},{read:true});
    res.status(200).json(notification)
} catch (error) {
    console.error("Internal Server Error:", error.message); 
    res.status(500).json({ error: error.message });
}
}
export const deletenotification = async(req,res)=>{
    try {
        const userid = req.user._id;
        await notify.deleteMany({to:userid});
        res.status(200).json({message:"Notification deleted successfully"})
    } catch (error) {
        console.error("Internal Server Error:", error.message); 
        res.status(500).json({ error: error.message });
    }
}
export const deleteonenotification = async(req,res)=>{
    try {
        const notificationid = req.params.id;
        const userid = req.user._id;
        const notification = await notify.findById(notificationid);
        if(!notification){
            return res.status(404).json({error:"Notification not found"})
        }
        if(notification.to.toString() !== userid.toString()){
            return res.status(400).json({error:"You are not allowed to delete this"})
        }
        await notify.findByIdAndDelete(notificationid);
        res.status(200).json({message:"Notification deleted successfully"})
    } catch (error) {
        console.error("Internal Server Error:", error.message); 
        res.status(500).json({ error: error.message });
    }
}