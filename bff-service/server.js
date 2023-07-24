const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios').default;
const cors = require("cors");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

const serviceMap = {
  cart: process.env.cart,
  products: process.env.products,
};

app.all('/:recipientServiceName*', async (req, res) => {
  console.log('original url', req.originalUrl);
  console.log('original method', req.method);
  console.log('body', req.body, serviceMap);
  const recipientServiceName = req.params.recipientServiceName;
  const recipientURL = serviceMap[recipientServiceName];
  console.log('recipientURL', recipientURL, recipientServiceName);

  if (!recipientURL) {
    res.status(502).send('Cannot process request');
    return;
  }

  const targetURL = `${recipientURL}${req.originalUrl}`;
  const forwardedHeaders = Object.fromEntries(
    Object.entries(req.headers).filter(([headerName]) => {
      return !['host', 'connection'].includes(headerName.toLowerCase());
    })
  );
  const auth = forwardedHeaders.authorization;
  const headers = {'Content-Type': 'application/json'};
  if (auth) {
    headers.authorization = auth
  }

  const axiosConfig = {
    method: req.method,
    url: targetURL,
    ...Object.keys(req.body || {}).length > 0 && {data: req.body},
    headers,
  }

  try {
    const response = await axios(axiosConfig);
    console.log('response', response.data);
    res.status(response.status).send(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || { error: 'Internal server error' };
    res.status(status).send(message);
  }
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON:', err.message);
    res.status(400).json({ error: 'Invalid JSON' });
  } else {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`BFF service listening at http://localhost:${port}`);
});