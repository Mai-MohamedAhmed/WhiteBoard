
var room
var name
var socket=io.connect();
var Color,Width
// Make the paper scope global, by injecting it into window
paper.install(window);
window.onload = function() {   // executed the code once the DOM is ready

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


	// Create an empty project and a view for the canvas
    paper.setup('myCan');
    var path,Otherpaths={};
    // Create a simple drawing tool:
    var tool = new Tool();
    // Define a mouseDown , mouseDrag and mouseUp handler
    tool.onMouseDown = function(event) {
        path = new Path();                    // Create a new path
        path.strokeColor = Color;             // Set the color to the current selected color
		path.strokeWidth=Width;               // Set the thickness to the current selected width
        path.add(event.point);                // Add the point to the path and draw it
		path.smooth();
		// Send this point to the server
        socket.emit('StartingPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor,"Width":path.strokeWidth});
    }

    tool.onMouseDrag = function(event) {
        path.add(event.point);                // Add the point to the path and draw it
        path.smooth();
		// Send this point to the server
        socket.emit('Continue',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor,"Width":path.strokeWidth });

    }
 
   tool.onMouseUp= function(event) {
        path.add(event.point);                // Add the point to the path and draw it
		path.smooth();
        var p = path.exportJSON();
		// Send this point to the server
		// send the path to the server to insert it in the database
        socket.emit('EndPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor,"Width":path.strokeWidth,"path":p});
    }
   // Receive messages from the server
   
    socket.on('newDrawing',function(data){                                      // Receive a point in a new path
        Otherpaths[data.ID]=new Path();                                        // Create a new path in Otherpaths[SenderID]
        Otherpaths[data.ID].strokeColor = data.Color;                          // Set the color 
        Otherpaths[data.ID].strokeWidth = data.Width;                          // Set the thickness
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));     // Add the point to the path and draw it
        Otherpaths[data.ID].smooth();
        view.draw();
    });
    socket.on('ContinueDrawing',function(data){                                // Receive a point in a path
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));         // Add the point to the path and draw it
        Otherpaths[data.ID].smooth();
        view.draw();
    });
    socket.on('StopDrawing',function(data){                                    // Receive an end point of a path
        Otherpaths[data.ID].add(new paper.Point(data.pointX,data.pointY));           // Add the point to the path and draw it
        Otherpaths[data.ID].smooth();
        view.draw();
        delete Otherpaths[data.ID];                                                  // Delete this path from Otherpaths array 
    });

	//Receive old paths for the new connecting client
    socket.on('savedPaths',function(data){
        var p = new Path();
        p.importJSON(data);
        project.activeLayer.addChild(p);
        view.draw();
        console.log('received path from room id '+ socket.room);
    });


}
// Change the thickness
function small() {
	Width=5
}
function medium() {
	Width=10
}
function large() {
	Width=20
}
//Change the color
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
