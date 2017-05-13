'use strict';

let fs = require("fs");
var path = require("path");

module.exports = function(socket, io, ss){
	socket.on('send', function(data) {
		socket.listingId = data.listingId;
		var filename = data.listingId;
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
		var filename = data.listingId;
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

	socket.on("disconnect", () => {
		let data = {
			listingId: socket.listingId
		};
		io.emit("live-stream-stop", data);
	})
}