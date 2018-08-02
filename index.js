var requestDebug = require('request-debug');
var fs = require('fs');
var request = require('request');
var path = require('path');
var requestDebugLog;

var requestTimeLineMiddleware = function (req, res, next) {
    // refresh the log on each express request
    requestDebugLog = {};
    requestDebug(request, function(type, data, r) {
        if (type === 'request') {
            let now =  (new Date).getTime();
            requestDebugLog[data.debugId] = {
                path: r.url.path,
                start_time: now
            }
        }
        if (type=== 'response') {
            var now =  (new Date).getTime();
            var log = requestDebugLog[data.debugId];
            let totalTime = now - log.start_time;
            log.end_time = now;
            log.total_time = totalTime;
        }
    });

    res.on('finish', () => {
        // generate html file

        var html = `
    <html>
    <head>
    <link rel="stylesheet" href="http://visjs.org/dist/vis.css"></html>
    <script src="http://visjs.org/dist/vis.min.js"></script>
    </head>
    <body>
        <div id="timeline"></div>
    </body>
    
     <script>
    var visData = [];
    var rawData = ${JSON.stringify(requestDebugLog)};
    Object.keys(rawData).forEach(function (debugId) {
      visData.push({
        id: debugId,
        start: new Date(rawData[debugId].start_time),
        end: new Date(rawData[debugId].end_time),
        content: rawData[debugId].path,
      });
    });
    var data = new vis.DataSet(visData);
    var options = {
        width: '100%',
        editable: false, 
        autoResize: true,
        zoomable: false,
        verticalScroll: true,
        margin: {
            item: 0
        }
    };
    var container = document.getElementById('timeline');

    new vis.Timeline(container, data, options);
    </script>
</html>
  `;
        var now = new Date();
        var filename = 'Request-TimeLine-' + now.getHours() + '-' + now.getMinutes()+ '-'  + now.getSeconds()+ '-'  + now.getMilliseconds()+ '-'   + now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate() +'.html';
        var file = path.join(__dirname,'../../', filename);

        fs.writeFile(file, html, function(err) {
            if(err) {
                return console.error("Failed to generate Request TimeLine Log", err);
            }
            console.log("Request TimeLine Log Generated");
        });
    });

    next();

};

module.exports = requestTimeLineMiddleware;