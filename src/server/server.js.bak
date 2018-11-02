const express = require('express');
const path = require('path');
var app = express();
var http = require('http').Server(app);


// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist/splitnass-table'));

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/splitnass-table/index.html'));
});

var io = require('socket.io')(http);
var lastSpieltag = undefined;
io.on('connect',socket => {
    console.log(`Client ${socket.client.id} connected`);
    socket.on("disconnect", () => {
        console.log(`Client ${socket.client.id} disconnected`);
    });
    socket.on("spieltag", data => {
        console.log(`sending updated spieltag`);
        lastSpieltag = data;
        io.compress(true).emit("spieltag", data);
    });
    socket.on("lastSpieltag", _ => {
        if (lastSpieltag) {
            console.log(`sending last spieltag`);
            socket.compress(true).emit("lastSpieltag", lastSpieltag);            
            // setTimeout(() => socket.compress(true).emit("lastSpieltag", lastSpieltag), 3000);            
        }
    });
});

const port = process.env.PORT || 4200;
http.listen(port);
console.log(`Splitnass server running on port ${port}`);

