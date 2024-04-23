const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        name: String,
        Message:String,
        timestamps:String,
        uid:String,
        roomId:String,
    },
    {
        timestamps: true,  
    }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
