var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var url = require("url");
var path = require("path");

var server = http.createServer(handleServer);
const userDirName = __dirname + "./contacts";

function handleServer(res, req) {
  let parsedUrl = url.parse(req.url, true);
  var store = "";
  req
    .on("data", (chunk) => {
      store = store + chunk;
    })
    .on("end", () => {
      if (req.method === "GET" && parsedUrl.pathname === "/") {
        fs.createReadStream("./index.html").pipe(res);
      } else if (req.method === "GET" && parsedUrl.pathname === "/about") {
        fs.createReadStream("./about.html").pipe(res);
      } else if (
        req.method === "GET" &&
        parsedUrl.pathname.split(".").pop() === "css"
      ) {
        res.setHeader("content-type", "text/css");
        fs.createReadStream("../assets/stylesheet/style.css").pipe(res);
      } else if (
        req.method === "GET" &&
        parsedUrl.pathname.split(".").pop().toLowerCase() === "png"
      ) {
        res.setHeader(
          "content-type",
          `image/${parsedUrl.pathname}.split(".").pop().toLowerCase()`
        );
        fs.readFile("./assets" + parsedUrl.pathname, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            return res.end(image);
          }
        });
      } else if (req.method === "GET" && parsedUrl.pathname === "/contact") {
        res.setHeader("content-type", "text/html");
        fs.createReadStream("./contact.html").pipe(res);
      } else if ((req.method === "POST", parsedUrl.pathname === "/form")) {
        let data = qs.parse(store);
        let username = parsedUrl.query.username;
        if (!data.username) return res.end("Username is required");
        if (!data.name) return res.end("Name is required");
        fs.open(userDirName + data.username + ".json", "wx", (err, fd) => {
          if (err) return console.log(err);
          fs.writeFile(fd, JSON.stringify(data), (err) => {
            if (err) return console.log(err);
            fs.close(fd, () => {
              return res.end(`${data.username} created successfully`);
            });
          });
        });
      } else {
        res.statusCode = 404;
        res.end("page not found");
      }
    });
}

server.listen(5000, () => {
  console.log("server is listening to port 5k");
});
