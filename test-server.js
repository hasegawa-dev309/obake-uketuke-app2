const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let reservations = [];
let headIndex = 0;

app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.get('/api/current-number', (req, res) => {
  if (reservations.length === 0 || headIndex >= reservations.length) {
    return res.json({ current: null });
  }
  res.json({ current: reservations[headIndex].id });
});

app.post('/api/reservations', (req, res) => {
  const { email, count, age } = req.body || {};
  if (!email || !count || !age) {
    return res.status(400).json({ success: false, message: "invalid payload" });
  }
  const newItem = {
    id: reservations.length + 1,
    email,
    count: Number(count),
    age,
    createdAt: new Date().toISOString(),
  };
  reservations.push(newItem);
  return res.json({ success: true, data: newItem });
});

app.post('/api/next', (req, res) => {
  if (headIndex < reservations.length) headIndex += 1;
  const current = reservations.length === 0 || headIndex >= reservations.length ? null : reservations[headIndex].id;
  res.json({ success: true, current });
});

app.post('/api/reset', (req, res) => {
  reservations = [];
  headIndex = 0;
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
