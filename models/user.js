var mongoose=require("mongoose");

//var LocalStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");


var userSchema=new mongoose.Schema({
	username:String,
	password:String,
	firstname:String,
	lastname:String,
	about:String,
	avatar:String,
	email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
	isPaid:{type:Boolean,default:false}
});

userSchema.plugin(passportLocalMongoose);

var User=mongoose.model("User",userSchema);

module.exports=User;