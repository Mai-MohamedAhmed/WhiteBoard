//include modules we're using in our app
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');


var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/exampleDb';
var coll = 'paths';
var coll2='chats';
var paths = [];
var chats = [];
var rooms =[];
var req_id="newroom";

var express=require('express');
app.get('/', function(req, res){
    app.use(express.static(path.join(__dirname),'/assets'));

   req_id="newroom";
   console.log('new request, req id= '+ req_id);
    res.sendFile(path.join(__dirname, '/index.html'));

});

app.get('/room/:roomid', function(req, res){
    app.use(express.static(path.join(__dirname),'/assets'));

    req_id=req.params.roomid;
        console.log('existing req_id is null ' + req_id );
    var x= false;
    for(i=0; i<rooms.length; i++){
        if(rooms[i]===req_id){
            x=true;
            break;
        }
    }
    if(x){
        res.sendFile(path.join(__dirname, '/index.html'));
    }else{
        res.send("the requested room doesn't exist");
    }


});


// Register events on socket connection
io.on('connection', function(socket){

    var room_id

    if(req_id !== "newroom"){
        room_id=req_id //existing room
        console.log('req_id = '+ req_id);
        console.log('joined existing room')

        MongoClient.connect(url, function(err, db) {

            console.log("getting data of room " +room_id);
            var cursor = db.collection(coll).find({room:room_id});
            cursor.forEach(function(path,err){
                paths.push(path.path);
                console.log(path.room);
            }, function(){
                db.close();
                for (var i in paths) {
                    socket.emit('savedPaths',paths[i],room_id);
                }
                paths=[];
            });

            var cursor = db.collection(coll2).find({room:room_id});
            cursor.forEach(function(myDoc,err){
                chats.push(myDoc);

            }, function(){
                db.close();
                for (var i in chats) {
                    socket.emit('chatMessage',chats[i].from, chats[i].msg, chats[i].room);
                }
                chats=[];
            });

        });
    }else{
        room_id=generateId() //new room
        console.log('generated id for new room is ' + room_id)
        rooms.push(room_id)
    }
    socket.emit('room',room_id)
    socket.join(room_id)
    socket.room=room_id;



    socket.on('chatMessage', function(from, msg,room){
        io.sockets.in(room).emit('chatMessage', from, msg,room);
        MongoClient.connect(url, function(err, db) {
            if(err) { return console.dir(err); }

            var collection = db.collection(coll2);

            collection.insert({'from':from, 'msg':msg, 'room':room});

        });

    });
    socket.on('notifyUser', function(user,room){
        io.sockets.in(room).emit('notifyUser', user,room);
    });

    socket.on('StartingPoint',function(data){

        socket.in(data.room).broadcast.emit('newDrawing', data);


    });
    socket.on('Continue',function(data){

        socket.in(data.room).broadcast.emit('ContinueDrawing', data);


    });
    socket.on('EndPoint',function(data){
        
        socket.in(data.room).broadcast.emit('StopDrawing', data);

        console.log('received end point');
        MongoClient.connect(url, function(err, db) {
            if(err) { return console.dir(err); }

            var collection = db.collection(coll);

            collection.insert({'path':data.path,'room':data.room});

        });

    });


});

// Listen application request on port 3000
http.listen(3000, function(){
    console.log('listening on *:3000');
});

function generateId(){
    var id = "id" + Math.random().toString(16).slice(2);
    return id;

}
