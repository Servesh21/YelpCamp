const User = require('../models/user')

module.exports.registerform=(req,res)=>{
    res.render('../views/users/register');

}

module.exports.register = async (req,res)=>{
    try{
    const {email,username,password} = req.body;
    const user = new User({email,username})
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) return next(err);
        req.flash('success',`${username},Welcome  to Yelpcamp` )
        res.redirect('/campgrounds');
    })
  
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/register')
    }
}

module.exports.loginform=(req,res)=>{
    res.render('users/login');
}

module.exports.login=(req,res)=>{
    req.flash('success','Welcome Back ')
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl)
    }

module.exports.logout=(req,res)=>{
        req.logout(function (err){
            if(err){
                return next(err);
            }
        });
    
        req.flash('success',"Successfully logged Out");
        res.redirect('/campgrounds')
    }