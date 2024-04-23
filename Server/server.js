
const express = require("express");
const mongoose = require('mongoose');
const room = require("./dbRooms");
const Message = require("./dbmessage");
const cors = require("cors");
const app = express();
const Pusher = require("pusher");
app.use(express.json());
app.use(cors());

const mongourl = "mongodb+srv://moulitharan003:lKqGMcdB0r2Qc9Oy@moulitharan003.uxftwpp.mongodb.net/whatsappclone";

mongoose.connect(mongourl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});


const pusher = new Pusher({
    appId: "1791300",
    key: "1212a6ec6365f5251d2b",
    secret: "ca8a9eb6395d1314d64a",
    cluster: "ap2",
    useTLS: true
  });


const db = mongoose.connection;
db.on("error", (err) => console.error("MongoDB connection error:", err));
db.once("open", () => 
{
console.log("MongoDB connected successfully")
const roomCollection = db.collection("rooms");
const changeStream = roomCollection.watch();

changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
        const roomDetails = change.fullDocument;
        pusher.trigger("room", "inserted", roomDetails)
            .catch(error => {
                console.error("Pusher trigger error:", error);
            });
    } else {
        console.log("Unhandled change operation:", change.operationType);
    }
});

changeStream.on("error", (error) => {
    console.error("Change stream error:", error);
});

const msgCollection = db.collection("messages");
const changeStream1 = msgCollection.watch();

changeStream1.on("change", (change) => {
    if (change.operationType === "insert") {
        const messageDetails = change.fullDocument;
        pusher.trigger("message", "inserted", messageDetails)
            .catch(error => {
                console.error("Pusher trigger error:", error);
            });
    } else {
        console.log("Unhandled change operation:", change.operationType);
    }
});

changeStream1.on("error", (error) => {
    console.error("Change stream error:", error);
});
})

app.post("/Message/new", async (req, res) => {
  try {
    const data = await Message.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/groups/create", async (req, res) => {
    try {
        const data = await room.create({ name: req.body.groupname });
        res.status(201).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/", (req, res) => {
    res.send("Hello, this is the backend");
});

app.get("/all/rooms", async (req, res) => {
    try {
        const data = await room.find({});
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get("/room/:id", async (req, res) => {
    try {
        const data = await room.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Error fetching room:", err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


app.get("/messages/:id", async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.id });
        res.status(200).json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
