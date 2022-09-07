const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const ora = require("ora");
const spinner = ora("Loading...");

const puppeteer = require("puppeteer");
const port = "8002";

const waitTime = (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

let scrape = async (path) => {
  const browser = await puppeteer.launch({ headless: true });
  path = path.replace(/\'|\s/g, "");
  fs.readdir(path, async (err, files) => {
    if (err) {
      console.log(`❌ Something wrong: ${err.message}!`);
      process.exit(1);
    }
    const dirs = files.filter((fileName) => !fileName.includes("."));
    for (let i = 0; i < dirs.length; i++) {
      const page = await browser.newPage();
      try {
        spinner.start();
        await page.setViewport({
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
        });
        await page.goto(`http://localhost:${port}/#${dirs[i]}`);
        let rhs = await page.$("#ide-preview");
        await waitTime(5000);
        await rhs.screenshot({
          path: `./screenshots/${dirs[i]}.png`,
        });
        spinner.succeed(`Screenshot of ${dirs[i]} saved!`);
      } catch (error) {
        spinner.error(`Could not save screenshot of ${dirs[i]}!`);
      }
    }
    await browser.close();
  });
};

inquirer
  .prompt({
    type: "input", // 问题类型，包括input，number，confirm，list，rawlist，password
    name: "path",
    message: "请输入项目examples绝对路径", // 问题
  })
  .then((answers) => {
    // console.log(answers.path);
    scrape(answers.path);
  });
