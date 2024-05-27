const express = require('express');
const app = express();
const connectDB = require('./db/db');
const validation = require('./middleware/validation')
const generateRoutes = require('./routes/generateRoute');
const cookieParser = require('cookie-parser');

connectDB();
app.use(express.json());
app.use(cookieParser());
app.get('/',validation,(req,res)=>{
    res.send("This is just for testing if app2 is working fine or not!");
})

app.get('/validate',validation, async(req,res)=>{
    res.send("This is just for check if the the validation is working or not!");
})
app.use('/api',generateRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})