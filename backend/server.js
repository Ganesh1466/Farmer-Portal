// ✅ dotenv MUST be loaded before any other requires that use process.env
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins (frontend URLs)
let allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
  : [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
  ];

// Always ensure the Vercel production URL is allowed
if (!allowedOrigins.includes("https://farmer-portal-xi.vercel.app")) {
  allowedOrigins.push("https://farmer-portal-xi.vercel.app");
}

// ✅ Express CORS options (REST API)

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],

};


// ✅ Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true
}));
app.options(/.*/, cors()); // ✅ preflight fix
app.use(express.json());

// ✅ Socket.io with specific CORS as requested
const io = new Server(server, {
  cors: {
    origin: [
      "https://farmer-portal-xi.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io globally available
global.io = io;

// ✅ Socket.io Logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_room", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  socket.on("send_interest", (notificationData) => {
    const { receiverId, cropName, buyerName } = notificationData;
    console.log(
      `Notification for ${receiverId}: ${buyerName} is interested in ${cropName}`
    );
    io.to(receiverId).emit("notification_received", notificationData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes — all requires are AFTER dotenv.config() so env vars are available
const cropRoutes = require("./routes/cropRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const mandiRoutes = require("./routes/mandiRoutes");
const chatRoutes = require("./routes/openai.Routes.js");
const notificationRoutes = require("./routes/notificationRoutes");
const contractRoutes = require("./routes/contractRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require('./routes/weatherRoutes');

app.use("/api/crops", cropRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/mandi", mandiRoutes);
app.use("/api", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/weather', weatherRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Create uploads folder if it doesn't exist
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Allowed Origins:`, allowedOrigins);
  console.log(`🔵 Gemini: ${process.env.GEMINI_API_KEY ? "Key found ✅" : "Key missing ❌"}`);
  console.log(`🟢 OpenAI: ${process.env.OPENAI_API_KEY ? "Key found ✅" : "Key missing ❌"}`);
  console.log(`🔐 Supabase: ${process.env.SUPABASE_URL ? "URL found ✅" : "URL missing ❌"}`);
});