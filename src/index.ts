import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";
import ticketRoutes from "./routes/ticket.route";
import authRoutes from "./routes/auth.routes"; // Ensure this import is correct
import passport from "passport";
import session from "express-session";
import cors from "cors";
import UserModel from "./models/User.model";

dotenv.config();
connectDB();
const app: Application = express();

app.use(express.json());
app.use(cors());

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Enable CORS preflight handling
app.options('*', cors());
app.use(
  session({
    secret: process.env.EXAMPLE_CLIENT_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use("/users", userRoutes);

app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);

app.use(authRoutes); // Ensure that the auth routes are added here

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the port 3000");
});

app.post('/users/register',(req:Request,res:Response)=>{
  UserModel.create(req.body)
  .then((User:any)=>{
    res.status(201).json(User);
  })
  .catch((error:any)=>{
    res.status(400).json(error);
  })
})

app.get('/users/login',(req:Request,res:Response)=>{
  const {email,password} = req.body;
  UserModel.findOne({email})
  .then((User:any)=>{
    if(User){
      if(User.password === password){
        res.status(200).json(User);
      }else{
        res.status(400).json('Invalid Credentials');
      }
    }
    else{
      res.status(404).json('User not found');
    }
  })
  .catch((error:any)=>{
    res.status(400).json(error);
  })
})

app.listen(port, () => {
  console.log(`Connected successfully on port ${port}`);
});
