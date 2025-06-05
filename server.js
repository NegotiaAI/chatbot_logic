import express from "express"
import dotenv from "dotenv"
import cors from 'cors';

import { connectDB } from "./config/db.js"

import chatRoute from'./routes/chats.js'

if(process.env.NODE_ENV!=='production')
{
    dotenv.config()
}


const app= express()
app.use(cors());
app.use(express.json())

app.use('/chats',chatRoute)

app.get("/",(req,res)=>{

    res.send("Welcome to NegotiAI chatbot API")

})


app.listen(process.env.PORT || 3000,()=>{
    connectDB()
    console.log("Server started...")
})

