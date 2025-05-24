const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/expense-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const transactionSchema = new mongoose.Schema({
  text: String,     
  amount: Number,   
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Transaction = mongoose.model('Transaction', transactionSchema);


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));


function getTotals(transactions) {
  const amounts = transactions.map(t => t.amount);
  const total   = amounts.reduce((a, b) => a + b, 0);
  const income  = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
  const expense = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0);
  return { total, income, expense };
}


app.get('/', async (req, res) => {
  const transactions = await Transaction.find().sort({ createdAt: -1 });
  const { total, income, expense } = getTotals(transactions);
  res.render('index', { transactions, total, income, expense });
});


app.post('/add', async (req, res) => {
  const { text, amount } = req.body;
  await Transaction.create({ text, amount });
  res.redirect('/');
});


app.post('/delete/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  res.render('edit', { transaction });
});

app.post('/edit/:id', async (req, res) => {
  const { text, amount } = req.body;
  await Transaction.findByIdAndUpdate(req.params.id, { text, amount });
  res.redirect('/');
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));