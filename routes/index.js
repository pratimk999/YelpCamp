var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var middleware=require("../middleware/middleware");


const stripe = require('stripe')
('sk_test_51H6dG7Au80BcOvFpYKK21226j2Lb37Rjr00PMcnw4DXNuBSQFDkyFxM2WdhM1WRwgzYlbb6zDvAXBOoaU6bmc9a000Zrn3rhvK');





router.get("/register",function(req,res){
	res.render("register");
});

router.post("/register",function(req,res){
	User.register(new User({
		username:req.body.username,
		firstname:req.body.firstname,
		lastname:req.body.lastname,
		avatar:req.body.avatar,
		email:req.body.email
	}),req.body.password,function(err,user){
		if(err){
			req.flash("error",err.message);
			return res.redirect("/register");
		}else{
			passport.authenticate("local")(req,res,function(){
				req.flash("sucess","Welcome to YelpCamp,nice to meet you " + user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

router.get("/login",function(req,res){
	res.render("login");
});
router.post("/login",passport.authenticate("local",{
	successRedirect:"/campgrounds",
	failureRedirect:"/login",
	failureFlash:true,
	successFlash:"Welcome back "

	
	}),function(req,res){
	
});



router.get("/logout",function(req,res){
	req.logout();
	req.flash("sucess","Logged you out");
	res.redirect("/campgrounds");
});



router.get('/checkout', middleware.isLoggedIn, (req, res) => {
    if (req.user.isPaid) {
        req.flash('success', 'Your account is already paid');
        return res.redirect('/campgrounds');
    }
    res.render('checkout', { amount: 20 });
});

// POST pay
router.post('/pay', middleware.isLoggedIn, async (req, res) => {
    const { paymentMethodId, items, currency } = req.body;

    const amount = 2000;

    try {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        error_on_requires_action: true,
        confirm: true
      });

      console.log("💰 Payment received!");

      req.user.isPaid = true;
      await req.user.save();
      // The payment is complete and the money has been moved
      // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

      // Send the client secret to the client to use in the demo
      res.send({ clientSecret: intent.client_secret });
	  req.flash("success","Payment successful");
	  res.redirect("/campgrounds");
    } catch (e) {
      // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
      // See https://stripe.com/docs/declines/codes for more
      if (e.code === "authentication_required") {
        res.send({
          error:
            "This card requires authentication in order to proceeded. Please use a different card."
        });
      } else {
        res.send({ error: e.message });
      }
    }
});


module.exports=router;
