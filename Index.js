const exp = require('constants');
const { json } = require('express');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 8080;

const router = express.Router();
app.use(express.json()); //Json Middlewear

app.listen (
    PORT , 
    () => console.log('its alive on port http://localhost:' + PORT)
)

app.get('/posts' , (req , res) =>{
    fs.readFile(__dirname + "/database.json" , 'utf8' , function (err , data) {
        data = JSON.parse(data);
        res.send(data.posts);
    });
})

app.post('/posts' , (req , res) => {
    const {content , username} = req.body;
    fs.readFile(__dirname + "/database.json" , 'utf8', function (err , data){
        data = JSON.parse(data);
        let currId = data.posts.length + 1;
        var currentdate = new Date();
        var strHours = currentdate.getHours();
        var strMinutes = currentdate.getMinutes();
        strDate = strHours + ":" + strMinutes;
        data.posts.push({
            "id": currId,
            "content": content,
            "username": username,
            "timestamp": strDate,
            "likes_count": 0,
            "comments_count": 0
        })
        fs.writeFile(__dirname + "/database.json" , JSON.stringify(data , null , 2) , (err) => {
            console.log(err);
         })
         res.send("posted:" + JSON.stringify(data.posts[currId - 1]));
    });
    
})


app.post(`/posts/:id/likes` , (req , res) => {
    let currData;
    const postId = req.params.id;
    const {username} = req.body;
    fs.readFile(__dirname + "/database.json" , 'utf8' , function (err , data){
        currData = JSON.parse(data);
        // currData.likes.push({   //add this if you want to remeber who did the likes :)
        //     "username": username
        // })
        for(let found = 0 , i = 0; (i < currData.posts.length) && (found == 0); i++){ //search post by id.
            if(currData.posts[i].id == postId){
                currData.posts[i].likes_count++;
                found = 1;
         }
        } 
        fs.writeFile(__dirname + "/database.json" , JSON.stringify(currData , null , 2) , (err) => {
            console.log(err);
        })
      res.send("liked the post: " + postId);
    })
})

app.post(`/posts/:id/comments` , (req , res) => {
    let currData;
    const postId = req.params.id;
    const { username , content } = req.body;
    fs.readFile(__dirname + "/database.json" , 'utf8' , function (err , data){
        data = JSON.parse(data);

        //Creating comments array
        if (!("comments" in data)){
            data.comments = [];
        }
        
        //Current time string
        var currentdate = new Date();
        var strHours = currentdate.getHours();
        var strMinutes = currentdate.getMinutes();
        strDate = strHours + ":" + strMinutes;

        //Find post user
        let postUser = "";
        let found = 0;
        for (let i = 0; i < data.posts.length & found != 1; i++){
            if (data.posts[i].id == postId){
                found = 1;
                postUser = data.posts[i].username;
                data.posts[i].comments_count++;
            }
        }

        // Post ID err
        if(found == 0){
            res.status(500).send("Post not found :(");
        }
        else {
            data.comments.push({
                "content": content,
                "username": username,
                "post_id": postId,
                "post_user": postUser,
                "timestamp": strDate
            })
            fs.writeFile(__dirname + "/database.json" , JSON.stringify(data , null , 2) , (err) => {
                console.log(err);
            })
            res.send("Comment posted, post ID:" + postId)
        }
    })
})


app.get('/comments' , (req , res) =>{
    fs.readFile(__dirname + "/database.json" , 'utf8' , function (err , data) {
        data = JSON.parse(data);
        if("comments" in data)
            res.send(data.comments);
        else
            res.status(505).send("There is no comments right now <3");
    });
})
