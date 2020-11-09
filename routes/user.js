var express=require("express");
var router=express.Router();
var Campground=require("../models/campground");
var middleware=require("../middleware/middleware");
var Review = require("../models/review");
var User=require("../models/user");
var dotenv=require("dotenv");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

router.get("/user/:id",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			req.flash("error","something wrong");
			return res.redirect("back");
		}else{
			Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds){
				if(err){
					req.flash("error","something wrong");
					return res.redirect("back");
				}else{
					res.render("user/user",{user:foundUser,campgrounds:campgrounds});
				}
			});
			
		}
	});
	
});


router.get("/user/:id/edit",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			req.flash("error"," User not found");
			return res.redirect("back");
		}else{
			res.render("user/show",{user:foundUser});
		}
	});
});


router.put("/user/:id",function(req,res){
	User.findByIdAndUpdate(req.params.id,
		req.body,
		function(err,updatedUser){
		if(err){
			req.flash("error","something wrong");
			return res.redirect("back");
		}else{
			
			res.redirect("/user/" + req.params.id);
		}
	})
})

//delete route
router.delete("/user/:id",function(req,res){
	User.findByIdAndDelete(req.params.id,function(err){
		if(err){
			req.flash("error","something wrong");
			return res.redirect("back");
		}else{
			res.redirect("/campgrounds");
		}
	});
});


// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'pratimkundu15@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'pratimkundu15@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'pratimkundu15@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'pratimkundu15@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});

module.exports=router;