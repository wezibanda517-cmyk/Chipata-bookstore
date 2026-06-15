var express = require("express");
var cors = require("cors");
var fetch = require("node-fetch");
var app = express();
app.use(cors());
app.use(express.json());
var KEY = "rQqYIZq7oHdX3aY0RJlW9WAg9BDXWseh";
var SECRET = "8+CfmnLpCYkL+M3rpeC1Vx4kNNg=";
var BASE = "https://pay.pesapal.com/v3";
app.get("/", function(req, res) {
  res.send("Chipata Bookstore Server is Running!");
});
app.post("/pay", function(req, res) {
  fetch(BASE + "/api/Auth/RequestToken", {
    method: "POST",
    headers: {"Content-Type": "application/json", "Accept": "application/json"},
    body: JSON.stringify({consumer_key: KEY, consumer_secret: SECRET})
  })
  .then(function(r) { return r.json(); })
  .then(function(auth) {
    var token = auth.token;
    var orderId = "CB-" + Date.now();
    var amount = req.body.amount;
    var phone = req.body.phone;
    var bookTitle = req.body.bookTitle;
    var bookId = req.body.bookId;
    var callbackUrl = req.body.callbackUrl;
    return fetch(BASE + "/api/URLSetup/RegisterIPN", {
      method: "POST",
      headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer " + token},
      body: JSON.stringify({url: callbackUrl, ipn_notification_type: "GET"})
    })
    .then(function(r) { return r.json(); })
    .then(function(ipn) {
      return fetch(BASE + "/api/Transactions/SubmitOrderRequest", {
        method: "POST",
        headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer " + token},
        body: JSON.stringify({
          id: orderId,
          currency: "ZMW",
          amount: amount,
          description: "Purchase: " + bookTitle,
          callback_url: callbackUrl + "&book_id=" + bookId + "&order=" + orderId,
          notification_id: ipn.ipn_id || "",
          billing_address: {
            phone_number: phone,
            email_address: req.body.email || "buyer@chipatabookstore.com",
            first_name: "Book",
            last_name: "Buyer"
          }
        })
      });
    })
    .then(function(r) { return r.json(); })
    .then(function(order) { res.json(order); });
  })
  .catch(function(err) { res.status(500).json({error: err.message}); });
});
var PORT = process.env.PORT || 3000;
app.listen(PORT, function() { console.log("Running on port " + PORT); });
