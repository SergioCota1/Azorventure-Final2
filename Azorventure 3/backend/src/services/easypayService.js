const axios = require("axios");

const EASYPAY_ENV = process.env.EASYPAY_ENV || "test";
const BASE_URL = EASYPAY_ENV === "production"
  ? "https://api.prod.easypay.pt/2.0"
  : "https://api.test.easypay.pt/2.0";

const getHeaders = () => ({
  "AccountId": process.env.EASYPAY_ACCOUNT_ID,
  "ApiKey": process.env.EASYPAY_API_KEY,
  "Content-Type": "application/json"
});

/**
 * Create a checkout session for a single payment
 */
exports.createCheckoutSession = async ({ valor, descricao, customer, key }) => {
  const amount = parseFloat(Number(valor).toFixed(2));
  const body = {
    type: ["single"],
    payment: {
      methods: ["cc", "mb", "mbw"],
      type: "sale",
      currency: "EUR",
      capture: {
        transaction_key: key || "bilhete",
        descriptive: descricao || "Compra de bilhete AzorVenture"
      }
    },
    order: {
      items: [
        {
          description: descricao || "Bilhete",
          quantity: 1,
          key: key || "bilhete",
          value: amount
        }
      ],
      key: key || "bilhete",
      value: amount
    }
  };

  if (customer) {
    body.customer = {};
    if (customer.name) body.customer.name = customer.name;
    if (customer.email) body.customer.email = customer.email;
  }

  const response = await axios.post(`${BASE_URL}/checkout`, body, {
    headers: getHeaders()
  });

  return response.data; // { id, session, config }
};

/**
 * Get single payment details by ID
 */
exports.getPaymentDetails = async (paymentId) => {
  const response = await axios.get(`${BASE_URL}/single/${paymentId}`, {
    headers: getHeaders()
  });
  return response.data;
};
