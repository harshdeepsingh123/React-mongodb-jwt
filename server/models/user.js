const mongoose =require('mongoose')
const Userschema=new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    email: { 
        type: String,
        required: true,
        match: /.+\@.+\..+/,
        unique: true
      },
    address:String,
    mobile:Number
})
const Users=mongoose.model("Userdata",Userschema)
module.exports=Users