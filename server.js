    });
    const ipnData = awaitconst express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CONSUMER_KEY = 'rQqYIZq7oHdX3aY0RJlW9WAg9BDXWseh';
const CONSUMER_SECRET = '8+CfmnLpCYkL+M3rpeC1Vx4kNNg=';
const PESAPAL_BASE = 'https://pay.pesapal.com/v3';

async function getToken() {
  const res = await fetch(PESAPAL_BASE + '/api/Auth/RequestToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    })
  });
  const data = await res.json();
  return data.token;
}

app.post('/pay', async function(req, res) {
  try {
    var amount = req.body.amount;
    var phone = req.body.phone;
    var email = req.body.email;
    var bookTitle = req.body.bookTitle;
    var bookId = req.body.bookId;
    var callbackUrl = req.body.callbackUrl;

    var token = await getToken();

    var ipnRes = await fetch(PESAPAL_BASE + '/api/URLSetup/RegisterIPN', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        url: callbackUrl,
        ipn_notification_type: 'GET'
      })
    });
    var ipnData = await ipnRes.json();

    var orderId = 'CB-' + Date.now();

    var orderRes = await fetch(PESAPAL_BASE + '/api/Transactions/SubmitOrderRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        id: orderId,
        currency: 'ZMW',
        amount: amount,
        description: 'Purchase: ' + bookTitle,
        callback_url: callbackUrl + '&book_id=' + bookId + '&order=' + orderId,
        notification_id: ipnData.ipn_id || '',
        billing_address: {
          phone_number: phone,
          email_address: email || 'buyer@chipatabookstore.com',
          first_name: 'Book',
          last_name: 'Buyer'
        }
      })
    });
    var orderData = await orderRes.json();
    res.json(orderData);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', function(req, res) {
  res.send('Chipata Bookstore Server Running!');
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
}); ipnRes.json();

    // Submit Order
    const orderId = 'CB-' + Date.now();
    const orderRes = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        id: orderId,
        currency: 'ZMW',
        amount: amount,
        description: `Purchase: ${bookTitle}`,
        callback_url: callbackUrl + '&book_id=' + bookId + '&order=' + orderId,
        notification_id: ipnData.ipn_id || '',
        billing_address: {
          phone_number: phone,
          email_address: email || 'buyer@chipatabookstore.com',
          first_name: 'Book',
          last_name: 'Buyer'
        }
      })
    });
    const orderData = await orderRes.json();
    res.json(orderData);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Chipata Bookstore Server Running ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
