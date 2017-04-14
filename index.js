//include modules we're using in our app
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/exampleDb';
var coll = 'paths';
var paths = [];

var rooms =[]
var req_id="newroom";

var express=require('express');
app.use(express.static(path.join(__dirname),'/assets'));
//app.use(express.static('public'));

app.get('/', function(req, res){

   req_id="newroom"

    res.sendFile(path.join(__dirname, '../chat-app', '/index.html'));

});

app.get('/room/:roomid', function(req, res){

    req_id=req.params.roomid;
    var x= false;
    for(i=0; i<rooms.length; i++){
        if(rooms[i]===req_id){
            x=true;
            break;
        }
    }
    if(x){
        res.sendFile(path.join(__dirname, '../chat-app', '/index.html'));
    }else{
        res.send("the requested room doesn't exist");
    }


});




// Register events on socket connection
io.on('connection', function(socket){


    // /*socket.on('newUser',function (user) {
        var room_id

        if(req_id !== "newroom"){
            room_id=req_id //existing room
        }else{
            room_id=generateId() //new room
            rooms.push(room_id)
        }
        socket.emit('room',room_id)
        socket.join(room_id)

	console.log("room id id " + room_id);
    MongoClient.connect(url, function(err, db) {
	console.log("Connected");
        var cursor = db.collection(coll).find({room:room_id});
        cursor.forEach(function(path,err){
            paths.push(path.path);
        }, function(){
            db.close();
            for (var i in paths) {
                console.log(paths[i]);
                io.sockets.in(room_id).emit('savedPaths',paths[i]);
            }
        });

    });
       // io.sockets.in(room_id).emit('chatMessage', 'System', user+' joined the room',room_id);


    /*});*/
    //socket.room=room_id;


    //console.log("room id = "+room_id)


    socket.on('chatMessage', function(from, msg,room){
        io.sockets.in(room).emit('chatMessage', from, msg,room);
    });
    socket.on('notifyUser', function(user,room){
        io.sockets.in(room).emit('notifyUser', user,room);
    });

    socket.on('StartingPoint',function(data){
        console.log(data.pointX);
        //socket.broadcast.emit('newDrawing',data);
        io.sockets.in(data.room).emit('newDrawing', data);
        

    });
    socket.on('Continue',function(data){
        console.log(data.pointX);
        //socket.broadcast.emit('ContinueDrawing',data);
        io.sockets.in(data.room).emit('ContinueDrawing', data);
        //console.log('sssssssss   ');

    });
    socket.on('EndPoint',function(data){
        console.log(data.pointX);
       // socket.broadcast.emit('StopDrawing',data);
        io.sockets.in(data.room).emit('StopDrawing', data);
        //console.log('sssssssss   ');
	console.log('data.room =  ' + data.room);
        MongoClient.connect(url, function(err, db) {
            if(err) { return console.dir(err); }
		console.log('data.room =  ' + data.room);
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
