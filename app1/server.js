require('dotenv').config();
const express = require('express');
const http = require('http');
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const path = require('path');
const cors = require('cors');
const token = require('./middleware/token');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT;

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/index', token, async (req, res) => {
  res.render('index');
});

app.get('/', (req, res) => {
  res.send("Hello World, This is for testing the server!");
});


server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
