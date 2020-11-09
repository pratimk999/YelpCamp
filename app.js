
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var Review=require("./models/review");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride=require("method-override");
var flash=require("connect-flash");
var User=require("./models/user");

require('dotenv').config();


var reviewRoutes = require("./routes/review");
var commentRoutes=require("./routes/comments");
var campgroundRoutes=require("./routes/campgrounds");
var indexRoutes=require("./routes/index");
var userRoutes=require("./routes/user");

//var seedDb=require("./seed");



mongoose.connect("mongodb://localhost/yelp_camp",{useNewUrlParser:true,useUnifiedTopology: true,useFindAndModify:false});


app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//seedDb();
app.use(require("express-session")({
	secret:"Anything",
	resave:false,
	saveUninitialized:false
}));

app.use(flash());

app.locals.moment=require("moment");

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentuser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("sucess");
	next();
});

app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(indexRoutes);
app.use(reviewRoutes);
app.use(userRoutes);


app.listen(3000,function(){
	console.log("your server has been started");
});




