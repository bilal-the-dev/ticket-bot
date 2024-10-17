const http = require("http");

const discordClient = require("../bot");

http
  .createServer(function (req, res) {
    res.write(discordClient); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080);
