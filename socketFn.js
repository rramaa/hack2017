'use strict';

let fs = require("fs");
var path = require("path");

module.exports = function(socket, io, ss){
	socket.on('send', function(data) {
		var filename = data.listingId + ".mp4";
		let fsStream = fs.appendFile(filename, data.streamData, (err, su) => {
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
		var filename = data.listingId + ".mp4";
		fs.unlink(filename, (err) => {
			if(err){
				console.log(err);
			}
			console.log("initialized", filename);
		})
	})

	socket.on("buyer", (data) => {
		socket.join("buyers");
	})
}