var express = require('express');
const userHelpers = require('../helpers/userHelpers');
const { response } = require('../app');
var router = express.Router();

var verifyLogin = (req,res,next)=>{
  if(req.session.user){
    next();
    
  }
  else{
    res.redirect('/signupAndLogin')
  }
}

/* GET home page. */
router.get('/', verifyLogin,async function(req, res, next) {
  let user  = req.session.user
  let task = await userHelpers.takeTask(user.email);
  res.render('users/base', { user,noHeader:true,task});
  
});

// signup form for users to signup to app
router.get('/signupAndLogin',(req,res)=>{
  
  res.render('users/signupAndLogin');
})

router.get('/signup',(req,res)=>{
  res.render('users/signup-form')
})

router.post('/signup',(req,res)=>{
  
  userHelpers.signup(req.body).then((response)=>{
    if (response.status) {
      res.redirect('/login');
    }
    else{
      res.redirect('/signup')
    }
  })
  console.log(req.body);
  
})

/*  login form for users to login */
router.get('/login',(req,res)=>{
  res.render('users/login-form');
});

router.post('/login',(req,res)=>{
  console.log(req.body);
  userHelpers.DoLogin(req.body).then((response)=>{
    console.log(response);

    if (response.status) {
      req.session.user=response.user;
      req.session.userLoggined = true
      console.log( req.session.user,' connected')
      res.redirect('/');
    }
    else{
      console.log('no user connected')
    }
  })
})

router.get('/addList',verifyLogin,(req,res)=>{  
  res.render('users/list')
})

router.post('/createNewTask',(req,res)=>{
  let user = req.session.user.email;
  req.body.user = user;
  userHelpers.CreateNewTask(req.body).then((response)=>{
    res.redirect('/')
  })
})

// add additional details on profile
router.get('/profile',async(req,res)=>{
  let data = await userHelpers.profile(req.session.user)
  res.render('users/profile',{data})
  
})

router.post('/editProfile',(req,res)=>{
  
  userHelpers.EditProfile(req.body,req.session.user.email).then((response)=>{
    
    if(req.files.image){
      let files = req.files.image
      files.mv('\public/images/userProfile/'+req.session.user._id+'.jpg');
    }

    res.redirect('/');
  })
})

router.get('/deleteTask/:TaskId',(req,res)=>{
  console.log(req.params.TaskId);
  userHelpers.deleteTask(req.params.TaskId,req.session.user.email)
  res.redirect('/')
})

module.exports = router;