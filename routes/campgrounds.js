var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");
var middleware=require("../middleware/middleware");
var Review = require("../models/review");




router.get("/",function(req,res){
	res.render("landing");
});

router.get("/campgrounds", function(req,res){
	if(req.query.paid){
		res.locals.success="payment succeeded welcome to yelpcamp";
	}

	Campground.find({},function(err,allCampgrounds){
		Campground.countDocuments().exec(function (err, count) {
			if(err){
				console.log(err);
			}else{
				res.render("campgrounds/index",{campgrounds:allCampgrounds,currentuser:req.user});
			}
		});	
	});
	
});


router.get("/campgrounds/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/home");
});

router.post("/campgrounds",middleware.isLoggedIn, function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var description=req.body.description;
	var price=req.body.price;
	var author={
		id:req.user._id,
		username:req.user.username
	};
		var newCampground={name:name ,price:price, image:image , description:description,author:author };

		Campground.create(newCampground,function(err,newlyCampground){
			if(err){
				console.log(err);
			}else{
				res.redirect("/campgrounds");
			}
		});
});


router.get("/campgrounds/:id",function(req,res){
	 Campground.findById(req.params.id).populate("comments likes ").populate({
	   	path: "reviews",
    	options: {sort: {createdAt: -1}}
	 }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


router.get("/campgrounds/:id/edit",middleware.checkOwner,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
	res.render("campgrounds/edit",{campground:foundCampground});
	});

});



router.put("/campgrounds/:id",middleware.checkOwner,function(req,res){
		Campground.findById(req.params.id, function (err, campground) {
			if (err) {
				console.log(err);
				res.redirect("/campgrounds");
			} else {
				campground.name = req.body.campground.name;
				campground.description = req.body.campground.description;
				campground.image = req.body.campground.image;
				campground.price = req.body.campground.price;

				campground.save(function (err) {
					if (err) {
						console.log(err);
						res.redirect("/campgrounds");
					} else {
						res.redirect("/campgrounds/" + campground._id);
					}
				});
			}
		});

});


router.delete("/campgrounds/:id",middleware.checkOwner,function(req,res){
	Campground.findByIdAndDelete(req.params.id,function(err){
		if(err){
			console.log(err);
			res.redirect("/campgrounds/" + req.params.id);
		}else{
			 res.redirect("/campgrounds");
		}

	});	
	
	
});


//Campground Like Route

router.post("/campgrounds/:id/like", middleware.isLoggedIn, function (req, res) {
		Campground.findById(req.params.id, function (err, foundCampground) {
		if (err) {
			console.log(err);
			return res.redirect("/campgrounds");
		}else{
			var foundUserLike = foundCampground.likes.some(function (like) {
		return like.equals(req.user._id);
			});
			if (foundUserLike) {
				
				foundCampground.likes.pull(req.user._id);
			} else {
		
				foundCampground.likes.push(req.user._id);
			}
			foundCampground.save(function (err) {
				if (err) {
					console.log(err);
					return res.redirect("/campgrounds");
				}
				return res.redirect("/campgrounds/" + req.params.id);
			});
		}
	});
});

module.exports=router;


