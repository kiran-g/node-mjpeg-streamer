# node-mjpeg-streamer
 Mjpeg streamer with v4l2 as camera interface
 
 Based on example code from [v4l2camera](https://github.com/bellbind/node-v4l2camera/blob/master/examples/image-stream-server.js)
 
## Installation

```
npm install mjpeg-streamer
```
## Usage

```
mjpeg-streamer [OPTION]

  -p, --port=ARG    Port
  -w, --width=ARG   Width
  -l, --height=ARG  Height
  -d, --device=ARG  V4L2 Device number. 0 for "/dev/video0"
  -h, --help        display this help
  -v, --version     show version

```

Then access the URL in browser like this:

    http://xxx.xxx.xxx.xxx:port

## License

MIT and LGPL-3.0 dual

## Author

Kiran G <kiran at gadgeon dot com>

## Copyright

Gadgeon Smart Systems Pvt Ltd

