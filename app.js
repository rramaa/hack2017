var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var socketIo = require("socket.io");
var socketFn = require("./socketFn");
var video = require('./video');
var port  = 5010;

app.get("/", (req, res, next) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/buyer", (req, res, next) => {
	res.sendFile(path.join(__dirname, "buyer.html"));
});

app.get("/jquery", (req, res, next) => {
	res.sendFile(path.join(__dirname, "jquery.js"));
});

app.get("/video/:filename", video)

var server = http.createServer(app);

var io = socketIo(server);

server.listen(port, () => {
	console.log("started");
	io.on("connection", (socket) => {
		socketFn(socket, io);
		// socketFn(socket, io, ss);
	})
});