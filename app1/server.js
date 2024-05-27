const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser'); 
const connectDatabase = require('./db/db');
const tokenRoutes = require('./routes/tokenRouter');
const axios = require('axios');

connectDatabase();

app.use(express.json());
app.use(session({
    secret: "This is just for testing",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("This is just for testing if the server is running fine or not!");
})

app.get('/testing', async (req, res) => {
  try {
      const token = req.cookies.token;

      const response = await axios.get('http://localhost:4000/api/test1', {
          headers: {
              'x-auth-token': token
          }
      });

      console.log('Response data:', response.data);

      res.status(200).json(response.data);
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'An error occurred while fetching the data' });
  }
});


app.use('/api', tokenRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
