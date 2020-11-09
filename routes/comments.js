var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var middleware=require("../middleware/middleware");

router.get("/campgrounds/:id/comments/new",middleware.isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new",{campground:campground});
		}
	});
});

router.post("/campgrounds/:id/comments",middleware.isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}else{
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("sucess","Thank You for your comment");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});


router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwner,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment updated");
			res.redirect("/campgrounds/" + req.params.id );
		}
	});
});

router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwner,function(req,res){
	
	Comment.findByIdAndDelete(req.params.comment_id,function(err){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success","Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


//COMMENT LIKE ROUTE

// router.post("/campgrounds/:id/comments/:comment_id/like", middleware.isLoggedIn, function (req, res) {
// 		Comment.findById(req.params.comment_id, function (err, foundComment) {
		
// 		if (err) {
// 			console.log(err);
// 			return res.redirect("back");
// 		}else{
// 			var foundUserLike = foundComment.commentlikes.some(function (like) {
// 				return like.equals(req.user._id);
// 			});
// 			if (foundUserLike) {
				
// 				foundComment.commentlikes.pull(req.user._id);
// 			} else {
		
// 				foundComment.commentlikes.push(req.user._id);
// 			}
// 			foundComment.save(function (err) {
// 				if (err) {
// 					console.log(err);
// 					return res.redirect("/campgrounds");
// 				}
// 				return res.redirect("/campgrounds/" + req.params.id + "/comments/");
// 			});
// 		}
// 	});
// });


module.exports=router;