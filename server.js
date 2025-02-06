const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Default route to serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Store solved crossword words
let solvedWords = {};

// WebSocket connection
io.on("connection", (socket) => {
    console.log("A user connected");

    // Send existing solved words when a user joins
    socket.emit("updateSolvedWords", solvedWords);

    // Listen for a correct word submission
    socket.on("wordSolved", ({ wordId, word }) => {
        if (!solvedWords[wordId]) { // Prevent duplicate solving
            solvedWords[wordId] = word;
            io.emit("updateSolvedWords", solvedWords); // Broadcast to all users
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Automatically detect your local IP address
const os = require("os");
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
}

// Start server on local network
const LOCAL_IP = getLocalIP();
server.listen(3000, "0.0.0.0", () => {
    console.log(`Server running on http://${LOCAL_IP}:3000`);
});