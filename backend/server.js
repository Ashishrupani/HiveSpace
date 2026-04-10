import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
//importing clerk
import { clerkMiddleware , clerkClient } from '@clerk/express'
import mongoose from "mongoose";
import homeRoutes from './routes/homeRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import ragRoutes from "./routes/ragRoutes.js";
import { initializeSocketHandlers } from './socket/socketHandlers.js';
import sessionRoutes from "./routes/sessionRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import streakRoutes from "./routes/streakRoutes.js";
import app from "./app.js";
//Dev route for syncing member names in groups (temporary until we have a better solution for this)
//import devRoute from "./routes/devRoute.js";

//load environmental variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
initializeSocketHandlers(io);

//connect to database
mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
  console.log('Connected to MongoDB');  
}).catch((err)=>{
    console.log(err.message);
});

app.use(clerkMiddleware());

//middlewares
app.use(express.json());
app.use(cors({ origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_OTHER],   credentials: true }));  //[process.env.CLIENT_URL, process.env.CLIENT_URL_OTHER],

//build routes here
app.get("/", (req, res) => {
    res.status(200).json({ sucess: 'true', message: 'hello from backend' });
})

app.use("/api/home", homeRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/streak", streakRoutes);
//app.use("/api/dev", devRoute);

//this is a health check route for debugging and monitoring
app.get("/api/health", (req, res) => {
    console.log("Health check route accessed");
    const response = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    console.log(`MongoDB connection status: ${response}`);
    res.status(200).json({ sucess: 'true', status: 'UP', message: 'API is healthy' });
})


//Setting up the server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})

export default app;
