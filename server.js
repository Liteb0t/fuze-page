var express = require("express");
var path = require("path");
var serveIndex = require("serve-index");

var app = express();

app.use(express.static(__dirname));
app.use("/media", serveIndex(__dirname + "/media"));

// show error page if url not found
app.get('*', function(req, res) {
    res.redirect('/error.html');
});

app.listen("5000");
console.log("server sunny omori");
