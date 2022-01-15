/**
 * Simple webservice that create carbon image using one request
 * @author : Elwan Mayencourt
 * @date : 15.01.2022
 */

//Requires
const puppeteer = require("puppeteer");
const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

//App config
const app = express();
const port = 3000;

//PATH
const CARBON_URL = `https://carbon.now.sh/?bg=rgba%28171%2C184%2C195%2C0%29&t=seti&wt=none&ds=true&dsyoff=0px&dsblur=68px&wc=true&wa=true&pv=0px&ph=0px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false`;
const DOWNLOAD_PATH = "/home/ubuntu/Downloads/";
const CTC_IMAGES_PATH = "/home/ubuntu/NodeJs/CTC/Images/";
const SERVER_URL = "http://serv.elwan.ch:3000/";
const IMAGE_ERROR_PATH = `${SERVER_URL}error.png`;
//Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let browser;
let page;

//Auto run puppeteer
(async () => {
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
})();



app.get("/", (req, res) => {
  try {
    (async () => {
      let extension = "";
      //Check the file extension to be able to colorize it correctly
      switch (req.query.extension) {
        case "js":
          extension = "javascript";
          break;
        case "json":
          extension = "application%2Fjson";
          break;
        case "html":
        case "htm":
          extension = "htmlmixed";
          break;
        case "css":
          extension = "css";
          break;
        case "php":
          extension = "text%2Fx-php";
          break;
        case "py":
          extension = "python";
          break;
        case "sh":
        case "bat":
          extension = "application%2Fx-sh";
          break;
      }

      //Open carbon with given code and programming language
      await page.goto(
        `${CARBON_URL}&l=${extension}&code=${encodeURIComponent(
          req.query.code
        )}`
      );

      //Generate random name
      let randomImageName = uuidv4();

      //Export the code into an image
      let selector = "#export-menu";
      await page.waitForSelector(selector);
      await page.click(selector);

      //Set random name
      selector = ".jsx-2285144321";
      await page.waitForSelector(selector);
      await page.type(selector, randomImageName);

      //Download the image
      selector = "#export-png";
      await page.waitForSelector(selector);
      await page.click(selector);

      await delay(1000);

      let imgCtcPath = `${CTC_IMAGES_PATH}${randomImageName}.png`;
      let imgDownloadPath = `${DOWNLOAD_PATH}${randomImageName}.png`;
      let imgServerPath = `${SERVER_URL}${randomImageName}.png`;

      fs.rename(imgDownloadPath, imgCtcPath, function (err) {
        let toSend = IMAGE_ERROR_PATH;
        if (!err) {toSend = imgServerPath};
        res.send(toSend);
        //Wait 30 seconds and delete the image
        setTimeout(() => {
          fs.unlink(imgCtcPath, (err) => {});
        }, 30000);
      })
    })();
  } catch (error) {res.send(IMAGE_ERROR_PATH)};
});

//Get image
app.get(/.*png$/, function (req, res) {
  res.sendFile(`${CTC_IMAGES_PATH}${req.originalUrl}`);
});

//Start app
app.listen(port, () => {
  console.log(`CTC Server Listening On Port :${port}`);
});
