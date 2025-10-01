import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';

//load environmental variables
dotenv.config();

const PORT = process.env.PORT || 5000;

//express app
const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//build routes here
app.get("/", (req, res)=>{
    res.status(200).json({sucess: 'true', message : 'hello from backend'});
})

//this is a health check route for debugging and monitoring
app.get("/api/health",(req,res)=>{
    res.status(200).json({sucess : 'true', status: 'UP', message: 'API is healthy'});
})

app.post("/",(req, res)=>{
    res.status(200).json({sucess: 'true', message : 'POST request received'});
})


//Setting up the server
app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})
