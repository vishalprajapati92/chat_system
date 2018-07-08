var express = require('express'), 
app = express(),
mongoose = require('mongoose'),
body_parse = require('body-parser');


app.use(express.static('public'));
app.use(body_parse.urlencoded({extended:false}));
app.use(body_parse.json());

mongoose.Promise = require('q').Promise;
mongoose.connect('mongodb://localhost:27017/jobDatabase')
var db = mongoose.connection;
db.on('error',function(){
    console.log('Error happen');
})

db.on('open',function(){
    console.log('connection db');
    app.listen(3000,function(){
        console.log("server is running localhost:3000/");
    });
})

// Username password email location phone number  usertype company or jobseekers

var user_schema = mongoose.Schema({
    username : String,
    password : String,
    email : String,
    phone : String,
    location : String,
    usertype :String
});
var post_schema = mongoose.Schema({
    title : String,
    description : String,
    keyword : String,
    location : String
});

var user_model = mongoose.model('userdata',user_schema)
var post_model = mongoose.model('postdata',post_schema)

app.get('/',function (req,res) {
     res.sendFile(__dirname + '/home.html');
});

app.post('/inserJobPost',function (req,res) {
    // console.log(req.body);
        var post_doc =  post_model(req.body);
        post_doc.save(function(err){
                    if(!err)
                    {
                        res.send(true);
                    }
                    else
                    {
                        res.send(false);
                    }
        });
    });

app.post('/getAllJobPost',function (req,res) {
    post_model.find({}, function(err, doc){
        if(!err)
        {
                res.send(doc);
        }
        else
        {
                console.log(err);
        }
    });
    
});
app.post('/searchPost',function (req,res) {
        post_model.find({$or:[ {'title':req.body.value}, {'description':req.body.value}, {'keyword':req.body.value},{'location':req.body.value} ]}, function(err, doc){
            if(!err)
            {
                // console.log(doc);
                     res.send(doc);
            }
            else
            {
                    res.send(err);
            }
        });
    
});
app.post('/insertUserInfo',function (req,res) {
// console.log(req.body);
    var user_doc =  user_model(req.body);
    user_doc.save(function(err){
                if(!err)
                {
                    res.send(true);
                }
                else
                {
                    res.send(false);
                }
    });
});
app.post('/isLoginData',function (req,res) {

    user_model.find({"username":req.body.username,"password":req.body.password}, function(err, doc){
        // console.log(err);  //returns Null
        // console.log(doc);  //returns Null.
        if(!err)
         {
            if(doc.length == 0)
             {
                 res.send({"isLoggedIn":false});
             }
             else
             {
                // console.log(doc);
                 res.send({"isLoggedIn":true,"name":doc[0]["name"],"usertype":doc[0]["usertype"]});
             }
         }
        else
         {
            res.send(false);
            console.log("error data" + err);
         }
    });  
});
