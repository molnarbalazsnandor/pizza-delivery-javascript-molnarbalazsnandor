const bodyParser = require("body-parser");
const express = require("express");
const fileUpload = require('express-fileupload');
const path = require("path");
const fs = require("fs");
const port = 3000;
let counter = 0;

const app = express();
//app.use(express.bodyParser());

app.use(fileUpload());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});

app.use('/images', express.static(`${__dirname}/../backend/data/img`));
app.use("/public", express.static(`${__dirname}/../frontend/public`));
// app.use("/public/img", express.static(`${__dirname}/../public/frontend/img`));

//get
app.get("/pizza", (req, res) => {
  fs.readFile(`${__dirname}/data/pizza.json`, (err, data) => {
    if (err) {
      console.log("hiba:", err);
      res.status(500).send("hibavan");
    } else {
      res.status(200).send(JSON.parse(data));
    }
  });
});

//post
app.post("/", (req, res) => {
  let currentTime = new Date();
  let timeId = currentTime.getMinutes() + currentTime.getUTCSeconds();

  const file = JSON.stringify(req.body, null, 2);
  const path = __dirname + "/../backend/data/orders/" + `order${timeId}.json`;

  fs.writeFileSync(path, file, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });
  res.status(200).send({ response: "rendelésed megkaptuk" });
});

app.post('/adminMode/', (req, res) => {
    const adminModePizzaList = req.body;
    const uploadPath = __dirname + '/../backend/data/pizza.json';

  fs.writeFileSync(
    uploadPath,
    JSON.stringify(adminModePizzaList, null, 4),
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
    }
  );
  res.send({ response: "pizza list has been updated!" });
});

app.post('/adminMode/image/', (req, res) => {
    const uploadPath = __dirname + '/../backend/data/img/';
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.send({response: "no images were uploaded!"});
    }
    const uploadedImagesArray = Object.keys(req.files);
    let uploadedPicture;

    uploadedImagesArray.forEach(imageKey => {
        uploadedPicture = req.files[imageKey];
        uploadedPicture.mv(uploadPath + uploadedPicture.name + '.png', err => {
            if (err) {
                return res.status(500).send(err);
            }
        });
    });
    res.send({response: "pizza images has been updated!"});
})


  app.delete('/delete', (req, res) => {
      const removePictureName = req.body.name;
      const removePath = __dirname + '/../backend/data/img/' + removePictureName + '.png';

      if (fs.existsSync(removePath)) {
          fs.unlinkSync(removePath, err => {
              if (err) {
                  console.log(err);
                  return res.status(500).send(err);
              }
          })
      }

      return res.status(200).send({response: `${removePictureName} has been deleted succesfully!`});
  })



//order editor

app.use("/order-editor", express.static(`${__dirname}/data/orders`));

app.get("/orders", (req, res) => {
  const ordersArray = fs.readdirSync(__dirname + "/data/orders/");
  let ordersResponse = [];

  ordersArray.forEach((order) => {
    const orderData = fs.readFileSync(__dirname + "/data/orders/" + order);
    ordersResponse.push(JSON.parse(orderData));
  });

  res.send(ordersResponse);
});

//open or closed order status start

app.post("/order/:id", (req, res) => {
  let paramId = parseInt(req.params.id);
  let newOrder = req.body;

  console.log(newOrder);

  fs.readFile(`${__dirname}/data/orders/order${paramId}.json`, (err, data) => {
    if (err) {
      console.log("hiba: ", err);
      res.status(500).send("hiba");
    } else {
      let order = JSON.parse(data);
      order.status = newOrder.status;

      fs.writeFile(
        `${__dirname}/data/orders/order${paramId}.json`,
        JSON.stringify(order, null, 2),
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).send(err);
          } else {
            res.send({ response: "done" });
          }
        }
      );
    }
  });
});

app.get("/status/open", (req, res) => {
  const ordersArray = fs.readdirSync(__dirname + "/data/orders/");
  let statusOpen = [];

  ordersArray.forEach((order) => {
    const orderData = fs.readFileSync(__dirname + "/data/orders/" + order);
    statusOpen.push(JSON.parse(orderData));
  });

  res.send(statusOpen.filter((element) => element.status === "open"));
});

app.get("/status/closed", (req, res) => {
  const ordersArray = fs.readdirSync(__dirname + "/data/orders/");
  let statusClosed = [];

  ordersArray.forEach((order) => {
    const orderData = fs.readFileSync(__dirname + "/data/orders/" + order);
    statusClosed.push(JSON.parse(orderData));
  });

  res.send(statusClosed.filter((element) => element.status === "closed"));
});

//open or closed order status end

app.listen(port, console.log(`server listening on http://127.0.0.1:${port}`));
