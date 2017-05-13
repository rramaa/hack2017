'use strict';

let fs = require("fs");
var path = require("path");

module.exports = function(socket, io, ss){
	socket.on('send', function(data) {
		var filename = data.listingId;
		let fsStream = fs.appendFile(filename, data.streamData, (err, su) => {
			console.log(data.listingId, "written")
			if(err){
				console.log("error", err);
				return;
			}
			io.emit("live-stream-init" , data)
		});
	});

	socket.on("live-stream-stop", (data) => {
		io.emit("live-stream-stop", data);
	});

	socket.on("init", (data) => {
		var filename = data.listingId;
		socket.listingId = data.listingId;
		socket.join(socket.listingId);
		fs.unlink(filename, (err) => {
			if(err){
				console.log(err);
			}
			console.log("initialized", filename);
		})
	})

	socket.on("buyer", (data) => {
		socket.join("buyers");
	});

	socket.on("comment", (data) => {
		socket.broadcast.to(data.listingId).emit("comment", data);
		socket.emit("comment", data);
	})

	socket.on("start", (data) => {
		socket.join(data.listingId);
	})

	socket.on("disconnect", () => {
		let data = {
			listingId: socket.listingId
		};
		io.emit("live-stream-stop", data);
	})
}