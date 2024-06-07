require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const connectDatabase = require('./db/redis');
const path = require('path');
const cors = require('cors');
const mongoose = require('./db/mongodb');
const token = require('./middleware/token');
const routes = require('./routes/clickDataRoute');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT;

const socketHandler = require('./controller/socket');

connectDatabase();

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

socketHandler(io);

app.get('/index', token, async (req, res) => {
  res.render('index');
});

app.get('/', (req, res) => {
  res.send("Hello World, This is for testing the server!");
});
app.use('/api', routes(io));

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
