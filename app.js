const express = require('express');
// const bodyParser = require('body-parser');

const client = require('./client.js');
const transporter = require('./mailconfig.js');

const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 5000;

function send_Email(keyword,tweet,Email_id){
    var mailOptions = {
    from: 'aviralmk@gmail.com',
    to: Email_id,
    subject: `Here is the recent tweet related to ${keyword}`,
    text: `${tweet}`
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

const url = 'mongodb://localhost:27017/twitter';

// // support parsing of application/json type post data
// app.use(bodyParser.json());

app.get('/twitter', (req, res) => 
{
    console.log('twitter get request');
    let keyword = req.query.keyword;
    let Email_id = req.query.email;
    let data = "";
    let counter = 0;
    
    const stream = client.stream('statuses/filter', {track: `${keyword}`});

    res.send('Tweet Notification Started')

    stream.on('data', async function(event) 
    {
        // console.log("Tweeted by " + event.user.name + " ::::>>> " +  "Tweet is :::" + event.text + " ::::>>>");
        counter += 1;
        
        if (counter < 11)
        {
            data += event.text + "\n";
        }
        else
        {
            MongoClient.connect(url, async function(err, db)
            {   
                if (err) throw err;
                
                var dbo = db.db("mydb");
                dbo.createCollection("Twitter", function(err, res) {
                  if (err) throw err;
                  console.log("Collection created!");
                //   db.close();
                });
                let tweet_Data ={
                    Tweet : data
                }

                dbo.collection("Twitter").insertOne(tweet_Data, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    db.close();
                  });
            })
            
            await send_Email(keyword,data,Email_id);
            data = "";
            counter=0;
        }
    });
    stream.on('error', function(error) {
        throw error;
    });
    
})


app.get('/Findtweet', (req, res) => 
{
    console.log('tweets counter');
    let keyword = req.query.keyword;
    let data = "";
   
    MongoClient.connect(url, async function(err, db)
    {
        if (err) throw err;
        
        var dbo = db.db("mydb");
        let Tweet_count = await dbo.collection('twitter').count(keyword);
        res.send(`The number of ${keyword} related tweets are ${Tweet_count}`);
        db.close();
    })     
})

//To start server
app.listen(port,function(){
console.log(`server start on port ${port}`)
})