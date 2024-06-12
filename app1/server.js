require('dotenv').config();
const express = require('express');
const http = require('http');
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const path = require('path');
const cors = require('cors');
const token = require('./middleware/token');

//Disable the three line below to remove the user click data functionality
const socketIO = require('socket.io');
const mongoose = require('./db/mongodb');
const routes = require('./routes/clickDataRoute');
//Two more lines need to be commented below

const app = express();
const server = http.createServer(app);

//This line also need to be disabled
const io = socketIO(server);
//There is one more line of code that need to be removed 

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

//This line of code also need to be removed
app.use('/api', routes(io));
//Commenting ends here

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
