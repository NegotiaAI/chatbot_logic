import mongoose from "mongoose";

const ChatSchema= new mongoose.Schema({
    chat_id:{
        type:String
    },
    website_id:{
        type:String
    },
    n_round:{
        type:Number,
        default:1
    },
    last_user_price:{
        type:Number,
        default:0
    },
    status:{
        type:String
    },
    accepted_price:{
        type:Number,
        default:0
    },
    last_bot_price:{
        type:Number,
        default:0
    },
    concessions:[{
        type:String
    }],
    buyerPrices:[{
        type:Number,
    }],
    pricing_pairs:[{
        user:{ type:Number,default:0},
        bot:{ type:Number,default:0}
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