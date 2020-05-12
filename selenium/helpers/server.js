var http = require('http');
var path = require('path')
var fs = require('fs');
let config = require("../config/config")

exports.startServer = async (port) => {
    const getFile = new Promise((resolve, reject) => {
        const htmlPath = path.resolve(config.workingDir, 'selenium', 'fixtures', 'index.html')
        fs.readFile(htmlPath, function (err, file) {
            if (err) {
                reject(err)
                console.log(err)
            }
            resolve(file)
        });
    })

    const createServer = async (htmlFile) => {
        return await http.createServer(function(req, res) {
            res.writeHeader(200, {"Content-Type": "text/html"});  
            res.write(htmlFile);  
            res.end();
        }).listen(port)
    }
    return createServer(await getFile)
}
