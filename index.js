const express = require("express");

const ffmpeg = require("fluent-ffmpeg");

const bodyParser = require("body-parser");

const fileUpload = require("express-fileupload");

const app = express();

//Node.js File system
const fs = require("fs");
const path = require('path');

//set ffmpeg path
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");

ffmpeg.setFlvtoolPath("C:/flvtool");

//console.log(ffmpeg);

//set there the tmp file should go
app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/frontEnd/index.html');
});
  
app.post("/convert", (req, res) => {
    //res.contentType(`video/${to}`);
    //res.attachment(`output.${to}`
  
    let to = req.body.to;
    let file = req.files.file;
    let fileName = `output.${to}`;
    console.log(to);
    console.log(fileName);
    
    
    // uploading the file
    // Use the mv() method to place the file somewhere on your server 
     file.mv("tmp/" + file.name, function (err) {
        if (err) return res.sendStatus(500).send(err);
        console.log("File Uploaded successfully");
    });
     
    /* ffmpeg.ffprobe("tmp/" + file.name, function(err, metadata) {
        if (err) {
            console.error(err);
        } else {
            // metadata should contain 'width', 'height' and 'display_aspect_ratio'
            //console.log(metadata);
            console.log(metadata.streams[1].width, metadata.streams[1].height);
        }
    }); */
    
     //provide the file name
    ffmpeg("tmp/" + file.name)

    //select the file format
    .withOutputFormat(to)

    .on("end", function (stdout, stderr) {
      console.log("Finished");

      //download file when finished Set disposition and send it.
       res.download(__dirname + fileName, function (err) {
        
        if (err) throw err;
        //delete file from tmp
        fs.unlink(__dirname + fileName, function (err) {
          if (err) throw err;
          console.log("File deleted");
        });
      }); 


      /* fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
      }); */
      
    })


    .on("error", function (err) {
      console.log("an error happened: " + err.message);
      fs.unlink("tmp/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
      });
    })
    
    .saveToFile(__dirname + fileName);
    

});




app.listen(5000,() => {
    console.log("App is listening on Port 5000")
});