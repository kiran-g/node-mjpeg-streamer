var http = require("http");
//http.globalAgent.maxSockets = 1000;
var PubSub = require("pubsub-js");
var util = require("util");
var v4l2camera = require("v4l2camera");
var Jpeg = require('jpeg').Jpeg;
//var FileOnWrite = require("file-on-write");
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

        var writer = new FileOnWrite({
            path: './video',
            ext: '.jpg'
        });

        PubSub.subscribe('MJPEG', function(msg, data) {
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
        //var png = toPng();
        //res.end(png, 'binary');
        //console.log("Sent data"+png.length);
    }
});
server.listen(3000);

var cam = new v4l2camera.Camera("/dev/video0")
cam.configSet({
    width: 352,
    height: 288
});
cam.start();

cam.capture(function loop() {

    var rgb = cam.toRGB();
    console.log("capture" + Buffer(rgb)[0]);
    PubSub.publish('MJPEG', Buffer(rgb));

    cam.capture(loop);
});

