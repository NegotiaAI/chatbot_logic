import mongoose from "mongoose";

const ChatSchema= new mongoose.Schema({
    chat_id:{
        type:String
    },
    website_id:{
        type:String
    },
    last_user_price:{
        type:String
    },
    last_bot_price:{
        type:String
    },
    buyerPrices:[{
       type:String
    }],
    pricing_pairs:[{
        user:{type:String},
        bot:{type:String,default:""}
    }],
    conversations:[{
        user:{type:String},
        bot:{type:String}
    }],
    contexts:[{
        type:String
    }]
});

const Chat=mongoose.model('Chat',ChatSchema)

export default Chat;