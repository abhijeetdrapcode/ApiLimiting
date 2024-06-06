const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const connectDatabase = require('./db/db');
const path = require('path');
const token = require('./middleware/token');
const generateToken = require('./middleware/tokenGenerator');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

connectDatabase();

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: "This is just for testing",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('buttonClick', (data) => {
    console.log('Button clicked:', data.buttonId);
    const newToken = generateToken('Abhijeet', 'Rana'); 
    io.emit('newToken', { token: newToken });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/index', token, async (req, res) => {
  res.render('index');
});

app.get('/', (req, res) => {
  res.send("Hello World, This is for testing the server!");
});



const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
