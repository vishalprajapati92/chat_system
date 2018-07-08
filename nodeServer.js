var express = require('express'), 
app = express(), 
objMongoDb = require('mongodb'),
body_parse = require('body-parser');

const strConnectionMongoDbUrl = 'mongodb://localhost/';
var db ="";

app.use(express.static('public'));
app.use(body_parse.urlencoded({extended:false}));
app.use(body_parse.json());

app.get('/',function (req,res) {
     res.sendFile(__dirname + '/main_page.html');
});
app.post('/registerUser',function (req,res) {
    
    db.collection('users').find({"name":req.body.name}).toArray(function(err,doc){
        if(!err)
        {
            // console.log(doc.length);
           if(doc.length >= 1)
           {
                 res.send(false);
           }
           else
           {
                db.collection('users').insert(req.body,function(err){
                    if(!err)
                    {
                        res.send(true);
                    }
                    else
                    {
                        res.send(false);
                    }
                });                     
           }
        }
        else
        {
            res.send(err);
        }

    });
    
    
});
app.post('/isLoginData',function (req,res) {
    db.collection('users').find({"name":req.body.name,"password":req.body.password}).toArray(function(err, doc){
        if(!err)
         {
             
            if(doc.length == 0)
             {
                res.send({"isLoggedIn":false});
             }
             else
             {
                console.log();
                res.send({"isLoggedIn":true,"name":doc[0]["name"]});
             }
         }
        else
         {
            res.send(false);
            console.log("error data" + err);
         }
    });  
});
app.post('/getUserdata',function (req,res) {
    // console.log("value params"+req.body.name)
    db.collection('users').find({"name":req.body.name}).toArray(function(err, doc){
        if(!err)
         {
            delete doc[0]._id;
            //  console.log(doc);
              res.send(doc);
         }
        else
         {
            res.send(false);
            // console.log("error data" + err);
         }
    });  
});

app.post('/editUserData',function (req,res) {
    // console.log(req.body);
    db.collection('users').update({"name":req.body.name},{$set :req.body},function(err, doc){
        if(!err)
         {
            // console.log("value");
             res.send(true);
         }
         else
         {
            res.send(false);
         }
    });  
});

app.post('/getMessage',function (req,res) {
    db.collection('message').find({"recipient":req.body.recipient}).toArray(function(err, doc){
        if(!err)
        {
        //  console.log(doc);
              res.send(doc);   
        }
    });

});
app.post('/deleteMessage',function (req,res) {
    db.collection("message").remove({"_id" : new objMongoDb.ObjectId(req.body._id)} , function(err, doc) {
        if (!err)
        {
            res.send(true);
        }
        else
        {
            res.send(false);
        }
    });
    console.log('Data id');
    // find throw object 
    // db.collection('message').find(new objMongoDb.ObjectId(req.body._id)).toArray(function(err, doc){
    //     if(!err)
    //     {
    //       console.log(doc);
    //         //  res.send(doc);   
    //     }
    // });

});


app.post('/sendReplay',function (req,res) {
    db.collection('message').find({"recipient":req.body.name}).toArray(function(err, doc){
        if(!err)
        {
            res.send(doc);   
        }
        // console.log(doc);
    });

});

app.post('/bookMarkMessage',function (req,res) {
    // console.log(req.body._id);
    db.collection('message').update({"_id" : new objMongoDb.ObjectId(req.body._id)},{ $set: {"important":1}}, function(err, doc){
        if(!err)
         {
            //  console.log("value");
                res.send(true);
         }
         else
         {
            // console.log("value1");
                res.send(false);
         }
    });  
});

app.post('/insertMessage',function (req,res) {
    // console.log(req.body);
      // recipient 
        // sender
        // title
        // description
        //created_at
        //important

    //    console.log( new Date(Date.now()).toLocaleString());  
        
    var message = {
        "recipient" : req.body.reciverName,
        "sender" : req.body.senderName,
        "title" : req.body.title,
        "description" : req.body.message,
        "created_at" :new Date(Date.now()).toLocaleString(),
        "important" : "0"
    };
    
    // console.log(message);

    db.collection('message').insert(message,function(err){
        if(!err)
        {
            res.send(true);
        }
        else
        {
            res.send(false);     // console.log("error data" + err);
        }
    });
    
});

objMongoDb.connect(strConnectionMongoDbUrl, function(err, client){
        if(!err)
        {
             console.log("connection establish");
                app.listen(3000,function(){
                    console.log("server is running localhost : 3000");
                });
             db = client.db('user_data');
        }
        else
        {
                console.log("connection err = "+err);
        }
});