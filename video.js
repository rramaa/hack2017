"use strict";
let fs      = require('fs')
let path    = require('path');


module.exports.check = function(req, res, next){
	let file = req.params.filename;

	fs.stat(file, function(err, stats) {
		if(err){
			return res.send({
				statusCode: "2XX",
				data: false
			})
		} else {
			return res.send({
				statusCode: "2XX",
				data: true
			})
		}
	})
}






//
//	Stream the video
//
module.exports.stream =  function(req, res, next) {

	//
	//	1.	Path to the movie to stream
	//
	let file = req.params.filename;

	//
	//	2.	Get meta information from the file. In this case we are interested
	//		in its size.
	//
	fs.stat(file, function(err, stats) {

		//
		//	1.	If there was an error reading the file stats we inform the
		//		browser of what actual happened
		//
		if(err)
		{
			//
			//	1.	Check if the file exists
			//
			if(err.code === 'ENOENT')
			{
				//
				// 	->	404 Error if file not found
				//
				return res.sendStatus(404);
			}

			//
			//	2.	IN any other case, just output the full error
			//
			return next(err)
		}

		//
		//	2.	Save the range the browser is asking for in a clear and
		//		reusable variable
		//
		//		The range tells us what part of the file the browser wants
		//		in bytes.
		//
		//		EXAMPLE: bytes=65534-33357823
		//
		let range = req.headers.range;
		//
		//	3.	Make sure the browser ask for a range to be sent.
		//
		if(!range)
		{
			//
			// 	1.	Create the error
			//
			let err = new Error('Wrong range');
				err.status = 416;

			//
			//	->	Send the error and stop the request.
			//
			return next(err);
		}

		//
		//	4.	Convert the string range in to an array for easy use.
		//
		let positions = range.replace(/bytes=/, '').split('-');

		//
		//	5.	Convert the start value in to an integer
		//
		let start = parseInt(positions[0], 10);

		//
		//	6.	Save the total file size in to a clear variable
		//
		let file_size = stats.size;

		//
		//	7.	IF 		the end parameter is present we convert it in to an
		//				integer, the same way we did the start position
		//
		//		ELSE 	We use the file_size variable as the last part to be
		//				sent.
		//
		let end = positions[1] ? parseInt(positions[1], 10) : file_size - 1;

		//
		//	8.	Calculate the amount of bits will be sent back to the
		//		browser.
		//
		let chunksize = (end - start) + 1;

		//
		//	9.	Create the header for the video tag so it knows what is
		//		receiving.
		//
		let head = {
			'Content-Range': 'bytes ' + start + '-' + end + '/' + file_size,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4'
		}

		//
		//	10.	Send the custom header
		//
		res.writeHead(206, head);

		//
		//	11.	Create the createReadStream option object so createReadStream
		//		knows how much data it should be read from the file.
		//
		let stream_position = {
			start: start,
			end: end
		}

		//
		//	12.	Create a stream chunk based on what the browser asked us for
		//
		let stream = fs.createReadStream(file, stream_position)

		//
		//	13.	Once the stream is open, we pipe the data through the response
		//		object.
		//
		stream.on('open', function() {

			stream.pipe(res);
			// res.pipe(stream);

		})

		//
		//	->	If there was an error while opening a stream we stop the
		//		request and display it.
		//
		stream.on('error', function(err) {

			return next(err);

		});

		stream.on("end", () => {
			console.log("stream ended");
		})

	});

};

// function _createStream(file, position){
// 	let stream = 
// }
