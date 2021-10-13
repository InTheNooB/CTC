/**
 * Simple webservice that create carbon image using one request
 * @author : Elwan Mayencourt
 * @date : 11.10.2021
 */


//Requires
const puppeteer = require('puppeteer')
const express = require('express')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

//App config
const app = express()
const port = 3000


//PATH
const CARBON_URL = `https://carbon.now.sh/?bg=rgba%28171%2C+184%2C+195%2C+1%29&t=seti&wt=none&ds=true&dsyoff=0px&dsblur=68px&wc=true&wa=true&pv=0px&ph=0px&ln=false&fl=1&fm=Hack&fs=14px&lh=133%25&si=false&es=2x&wm=false`
const DOWNLOAD_PATH = '/home/ubuntu/Downloads/carbon.png'
const PROJECT_PATH = '/home/ubuntu/NodeJs/CTC/'
const SERVER_URL = 'http://195.15.240.106:3000/'

//Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let browser
let page


//Auto run puppeteer
(async () => {
  browser = await puppeteer.launch({ headless: false })
  page = await browser.newPage()
})()

app.get('/', (req, res) => {
  try {
    ;(async () => {
      let extension = ''
      //Check the file extension to be able to colorize it correctly
      switch (req.query.extension) {
        case 'js':
          extension = 'javascript'
          break
        case 'json':
          extension = 'application%2Fjson'
          break
        case 'html':
        case 'htm':
          extension = 'htmlmixed'
          break
        case 'css':
          extension = 'css'
          break
        case 'php':
          extension = 'text%2Fx-php'
          break
        case 'py':
          extension = 'python'
          break
        case 'sh':
        case 'bat':
          extension = 'application%2Fx-sh'
          break
      }

      //Open carbon with given code and programming language  
      await page.goto(
        `${CARBON_URL}&l=${extension}&code=${encodeURIComponent(
          req.query.code,
        )}`,
      )

      //Export the code into an image
      let selector = '#export-menu'
      await page.waitForSelector(selector)
      await page.click(selector)
      selector = '#export-png'
      await page.waitForSelector(selector)
      await page.click(selector)
      //Waits for the download to finish
      await delay(1000)

      //Generate random name
      let name = uuidv4() + '.png'
      let imgPath = `${PROJECT_PATH}${name}`
      fs.rename(DOWNLOAD_PATH, imgPath, () => {
        //Return the image path
        res.send(`${SERVER_URL}${name}`)
        //Wait 30 seconds and delete the image
        setTimeout(() => {
          fs.unlink(imgPath, (err) => {})
        }, 30000)
      })
    })()
  } catch (error) {}
})


//Get image
app.get(/.*png$/, function (req, res) {
  res.sendFile(`${PROJECT_PATH}${req.originalUrl}`)
})

//Start app
app.listen(port, () => {
  console.log(`CTC Server Listening On Port :${port}`)
})
