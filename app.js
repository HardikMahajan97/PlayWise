const express = require("express");
const app = express();

let port = 3000;

app.get("/", (req,res) => {
    res.send("Port Checking successful ! Welcome to PlayWise");
});
app.listen(port, (req,res) => {
    console.log("Listening on port " + port + ". Welcome to PlayWise!");
});