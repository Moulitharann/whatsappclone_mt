const mongoose=require("mongoose");

const roomschema=mongoose.Schema(
    {
       name:String,
    },
    {
        timestamps:true,
    }
);

const room=mongoose.model("rooms",roomschema)

module.exports=room;