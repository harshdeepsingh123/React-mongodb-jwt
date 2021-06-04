require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const app=express();
const cors=require('cors')
const User =require("./models/user")
const bcrypt = require('bcryptjs')
const bodyparser=require('body-parser')
app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({extended:true}));

const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'
mongoose.connect("mongodb+srv://harsh_d123:softwarec+12@mern.gjnmn.mongodb.net/Userdata?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useCreateIndex: true, 
    useUnifiedTopology: true,
    useFindAndModify: true
}).then(()=>{
    console.log("connected")
}).catch((err)=>{

    console.log(err)
})

// app.post('/login',(req,res)=>{
//     const username=req.body.username
//     const user={name:username}

//     const accessToken =jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
//     res.json({accessToken:accessToken})
// })
// function authenticateToken(req,res,next){
//     const authheader=req.headers['authorization']
//     const token= authheader &&   authheader.split(' ')[1]
//     if(token==null) return res.sendStatus(401);
// }
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
  
	if (token == null) return res.sendStatus(401)
  
	jwt.verify(token, JWT_SECRET , (err, user) => {
	  
  
	  if (err) return res.sendStatus(403)
  
	  req.user = user
		console.log(req.user)
	  next()
	})
  }
  app.get('/api', authenticateToken,async (req, res) => {
	// executes after authenticateToken
	// ...
	const data=await User.findById(req.user.id);
	console.log(data)
	console.log('api')
	res.json({status:'ok'})
  })
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
	console.log('harsh')
	const { username,name, password: plainTextPassword ,email,address,mobile} = req.body

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 7) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 8 characters'
		})
	}

	const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		const response = await User.create({
			username,
			name,
			password,
			email,
			address,
			mobile
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		 if (error.code === 11000 && error.keyPattern.email) {
			// duplicate key
			return res.json({ status: 'error', error: 'email already in use' })
		} if (error.code === 11000 && error.keyPattern.username) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})
app.listen(3001,()=>{
    console.log("server started at 3001");
})