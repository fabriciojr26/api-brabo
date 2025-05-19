import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

// Função para hash SHA-256
function hashSHA256(value) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

app.post('/purchase', async (req, res) => {
  const { email, phone, value, currency, fbc, fbp, ip, userAgent, url } = req.body;

  const pixelId = '1764411377804246'; // seu Pixel
  const token = process.env.META_TOKEN;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: url,
        user_data: {
          em: [hashSHA256(email)],
          ph: [hashSHA256(phone)],
          client_ip_address: ip,
          client_user_agent: userAgent,
          fbc: fbc,
          fbp: fbp
        },
        custom_data: {
          currency: currency || "BRL",
          value: parseFloat(value)
        }
      }
    ]
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${pixelId}/events`,
      payload,
      { params: { access_token: token } }
    );
    res.json({ success: true, fb_response: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
