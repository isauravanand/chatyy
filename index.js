const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);
async function main() {
    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)}

main()
    .then(() => {
        console.log("Connection successfull");
    })
    .catch(err =>
        console.log(err)
    );




const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin:process.env.ORIGIN,
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });
});