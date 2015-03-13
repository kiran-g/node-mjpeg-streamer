#!/usr/bin/env node

var http = require("http");
//http.globalAgent.maxSockets = 1000;
var PubSub = require("pubsub-js");
var util = require("util");
var v4l2camera = require("v4l2camera");
var Jpeg = require('jpeg').Jpeg;
var version = "0.0.1";
var appname = "mjpeg-streamer";
// node-getopt oneline example.
Getopt = require('node-getopt')

getopt = new Getopt([
  ['p' , 'port=ARG'  , 'Port'],
  ['d' , 'device=ARG'   , 'V4L2 Device number. 0 for "/dev/video0"'],
  ['h' , 'help'                , 'display this help'],
  ['v' , 'version'             , 'show version']
])              // create Getopt instance
.bindHelp()     // bind option 'help' to default action


opt = getopt.parse(process.argv.slice(2));

var port=opt.options["port"]
if (opt.options["version"])
{
    console.log(appname+" "+version)
    process.exit(0);
}
var device=opt.options["device"]
if (typeof port == 'undefined' || port == null){
   console.error("Port argument missing");
   getopt.showHelp();
    process.exit(1);
}
if (typeof device == 'undefined' || device == null){
   console.error("Device argument missing");
   getopt.showHelp();
    process.exit(1);
}




var server = http.createServer(function(req, res) {
    //console.log(req.url);
    if (req.url === "/") {
        res.writeHead(200, {
            "content-type": "text/html;charset=utf-8",
        });
        res.end(["<!doctype html>", "<html><head><meta charset='utf-8'/>", "</head><body>", "<img src='test.jpg' id='cam' width='352' height='288' />", "</body></html>", ].join(""));
        return;
    }
    if (req.url.match(/^\/.+\.jpg$/)) {
        console.log("requested " + req.url)
        var boundary = "BOUNDARY"
        res.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace;boundary="' + boundary + '"',
            'Connection': 'keep-alive',
            'Expires': 'Fri, 01 Jan 1990 00:00:00 GMT',
            'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
            'Pragma': 'no-cache'
        });


        var subscriber_token=PubSub.subscribe('MJPEG', function(msg, data) {
            //console.log( msg, data );
            var jpeg = new Jpeg(Buffer(data), cam.width, cam.height);
            var jpeg_image_data = jpeg.encodeSync();
            //jpeg.encodeSync().pipe(writer)
            //writer.write(Buffer(jpeg_image_data))
            // console.log("Buffer(jpeg_image_data).length: "+Buffer(jpeg_image_data).length);
            console.log("Serve " + data[0])
            res.write('--' + boundary + '\r\n')
            res.write('Content-Type: image/jpeg\r\n');
            res.write('Content-Length: ' + data.length + '\r\n');
            res.write("\r\n");
            res.write(Buffer(jpeg_image_data), 'binary');
            res.write("\r\n");

        });
        res.on('close', function() {

            console.log("Connection closed!");
            PubSub.unsubscribe( subscriber_token);
            res.end();

        });

        //var png = toPng();
        //res.end(png, 'binary');
        //console.log("Sent data"+png.length);
    }
});

server.on('error', function (e) {
      if (e.code == 'EADDRINUSE') {
        console.log('Address in use');
      }
    else if(e.code == "EACCES")
    {
        console.log("Illegal port"); 
    }
    else
    {
        console.log("Unknown error"); 
    }
    process.exit(1);
    
});


server.listen(port);
console.log("Listening at port "+port);

try
{
    var cam = new v4l2camera.Camera("/dev/video"+device)
}
catch(err)
{
    console.log("v4l2camera error");
    process.exit(1);
}

console.log("Opened camera device /dev/video"+device);

cam.configSet({
    width: 352,
    height: 288
});

cam.start();

cam.capture(function loop() {

    var rgb = cam.toRGB();
    PubSub.publish('MJPEG', Buffer(rgb));

    cam.capture(loop);
});

