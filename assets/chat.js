var room
var name
var socket=io.connect();
paper.install(window);
window.onload = function() {

    $("#sub").click(function(e) {

        var n= $('#um').val();
        if(n=='')
            n=makeid();

        $('#user').text(n);
        //socket.emit('newUser', n);*/
        document.getElementById('welcome_popup').style.display='none';
        document.getElementById('welcome_cover').style.display='none';

    });

    name= $('#um').val();
    var ID;
    socket.on('connect', function(){
        ID=socket.id;


    });



    paper.setup('myCan');
    var path,Otherpaths={};
    // Create a simple drawing tool:
    var tool = new Tool();
    // Define a mousedown and mousedrag handler
    tool.onMouseDown = function(event) {
        path = new Path();

        /*path.fillColor = {
         hue: Math.random() * 360,
         saturation: 1,
         brightness: 1
         };*/
        path.strokeColor = 'red';
        path.add(event.point);
        //event.preventDefault();
        console.log("Sent room = " +room);
        socket.emit('StartingPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor,"room":room});
    }

    tool.onMouseDrag = function(event) {
        path.add(event.point);
        path.smooth();
        event.preventDefault();

        socket.emit('Continue',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor ,"room":room});

    }
    tool.onMouseUp= function(event) {
        path.add(event.point);
        var p = path.exportJSON();
        socket.emit('EndPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor, "room":room, "path":p});
        path.smooth();
    }

    socket.on('newDrawing',function(data){
        Otherpaths[data.ID]=new Path();
        Otherpaths[data.ID].strokeColor = data.Color;
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));
        Otherpaths[data.ID].smooth();
        view.draw();
    });
    socket.on('ContinueDrawing',function(data){

        Otherpaths[data.ID].strokeColor = data.Color;
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));
        Otherpaths[data.ID].smooth();
        view.draw();
    });
    socket.on('StopDrawing',function(data){
        Otherpaths[data.ID].strokeColor = data.Color;
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));
        Otherpaths[data.ID].smooth();
        view.draw();
        delete Otherpaths[sessionId];
    });

    socket.on('savedPaths',function(data){

        var p = new Path();
        p.importJSON(data);
        project.activeLayer.addChild(p);
        view.draw();


    });


}

socket.on('chatMessage', function (from, msg,room) {
    var me = $('#user').text();
    var c = (from == me) ? 'self' : 'other';
    var f = (from == me) ? 'Me' : from;

    var d = new Date(); // for now
    var t = d.getHours() + ':' + d.getMinutes();

    var text=  '<li class="' +c +'"> <div class="msg"> <h>'+ f+ '</h> <p>'+msg+'</p> <time>'+t+'</time> </div> </li>';
    $('#messages').append(text);

});

socket.on('notifyUser', function(user,room){
    //var me = $('#user').val();
    if(user != name) {
        $('#notifyUser').text(user + ' is typing ...');
    }
    setTimeout(function(){ $('#notifyUser').text(''); }, 10000);;
});

socket.on('room', function (roomid) {
    room=roomid;
    //alert(room)
    console.log('sent room id')
    $('#url').text("http://localhost:3000/room/"+room);
    /*var u= $('#um').val();
    var s = u + 'joined the room';
    socket.emit('chatMessage','system',s,room);*/

});


function submitfunction(){
    var from = $('#user').text();
    var message= $('#m').val();
    if(message != ''){
        socket.emit('chatMessage',from,message,room); //send to server on chatMessage
    }
    $('#m').val('').focus();

    return false;

}

function notifyTyping(){
    socket.emit('notifyUser' ,name,room);
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}






