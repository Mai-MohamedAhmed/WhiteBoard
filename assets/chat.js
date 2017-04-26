
var room
var name
var socket=io.connect();
var Color,Width
paper.install(window);
window.onload = function() {

	//get user name from prompt
	$("#sub").click(function(e) {

        var n= $('#um').val();
        if(n=='')
            n=makeid();

        $('#user').text(n);
        document.getElementById('welcome_popup').style.display='none';
        document.getElementById('welcome_cover').style.display='none';

    });
	
 //set client name to the entered value 
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

        path.strokeColor = Color;
		path.strokeWidth=Width;
        path.add(event.point);
       
        socket.emit('StartingPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor,"Width":path.strokeWidth});
    }

    tool.onMouseDrag = function(event) {
        path.add(event.point);
        path.smooth();
        event.preventDefault();

        socket.emit('Continue',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor,"Width":path.strokeWidth });

    }
 
   tool.onMouseUp= function(event) {
        path.add(event.point);
		path.smooth();
        var p = path.exportJSON();
        socket.emit('EndPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor,"Width":path.strokeWidth,"path":p});
        console.log('sending end point' + event.point.x +' '+  event.point.y);
    }
   
    socket.on('newDrawing',function(data){
        Otherpaths[data.ID]=new Path();
        Otherpaths[data.ID].strokeColor = data.Color;
        Otherpaths[data.ID].strokeWidth = data.Width;
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));
        Otherpaths[data.ID].smooth();
        view.draw();
    });
    socket.on('ContinueDrawing',function(data){

        Otherpaths[data.ID].strokeColor = data.Color;
		Otherpaths[data.ID].strokeWidth = data.Width;
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));
        Otherpaths[data.ID].smooth();
        view.draw();
    });
    socket.on('StopDrawing',function(data){
        Otherpaths[data.ID].strokeColor = data.Color;
		Otherpaths[data.ID].strokeWidth = data.Width;
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));
        Otherpaths[data.ID].smooth();
        view.draw();
        delete Otherpaths[data.ID];
    });

    socket.on('savedPaths',function(data){

        var p = new Path();
        p.importJSON(data);
        project.activeLayer.addChild(p);
        view.draw();
        console.log('received path from room id '+ socket.room);


    });


}
function small() {
	Width=5
}
function medium() {
	Width=10
}
function large() {
	Width=20
}
function erase() {
	Color="White"
}
function BLACK() {
	Color="black"
}
function BLUE() {
	Color="blue"
}
function RED() {
	Color="red"
}
function GREEN() {
	Color="green"
}
function YELLOW() {
	Color="yellow"
}

//on receiving a chat message from server, display it
socket.on('chatMessage', function (from, msg) {
    var me = $('#user').text();
    var c = (from == me) ? 'self' : 'other';
    var f = (from == me) ? 'Me' : from;

    var d = new Date(); 
    var t = d.getHours() + ':' + d.getMinutes();

    var text=  '<li class="' +c +'"> <div class="msg"> <h>'+ f+ '</h> <p>'+msg+'</p> <time>'+t+'</time> </div> </li>';
    $('#messages').append(text);

});

//on receiving assigned room id from server add link to room
socket.on('room', function (roomid) {
    room=roomid;
    console.log('received room id' + roomid)
    $('#url').text("http://localhost:3000/room/"+room);
  
});

//send chat message to server
function submitfunction(){
    var from = $('#user').text();
    var message= $('#m').val();
    if(message != ''){
        socket.emit('chatMessage',from,message); //send to server on chatMessage
    }
    $('#m').val('').focus();

    return false;

}

//generate a random id to the user if ther didn't enter their name

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
