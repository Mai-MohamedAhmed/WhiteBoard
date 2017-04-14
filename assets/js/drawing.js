paper.install(window);
	window.onload = function() {
		var socket=io.connect();
		
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

			socket.emit('StartingPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor, "room":room});
		}

		tool.onMouseDrag = function(event) {
			path.add(event.point);
			path.smooth();
			event.preventDefault();
			socket.emit('Continue',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor , "room":room});
			
		}
		tool.onMouseUp= function(event) {
			path.add(event.point);
			socket.emit('EndPoint',{"pointX":event.point.x,"pointY":event.point.y,"ID":ID,"Color":path.strokeColor , "room":room});
		
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
		delete paths[sessionId];
		});
	}