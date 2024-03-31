import express from 'express'
import path from 'path'
import connectDb from '../connectDb.js'
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from '../routes/authRouter.js';
import checkForAuth from '../middlewares/chekForAuth.js'
import memberRouter from '../routes/memberRouter.js';
import organizationRouter from '../routes/organizationRouter.js'
import testingRouter from '../routes/testingRouter.js';
import seatRouter from '../routes/seatRouter.js';
import accountRouter from '../routes/accountRouter.js';
import paymentRouter from '../routes/paymentRouter.js';
import AuthController from '../controllers/authController.js';
import schedule from 'node-schedule';
import { dueMonthlyFeeForAllOrganizations } from '../controllers/scheduleController.js';


const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DATABASE_URL; 

connectDb(DB_URL);

const corsOptions = {
    origin : "*",
    credentials : true
};

//scheduling work;
 schedule.scheduleJob('* * * * *' , ()=>dueMonthlyFeeForAllOrganizations())






app.use(cors(corsOptions));

app.use(express.urlencoded({extended : false}));

app.use(express.json());

app.use(checkForAuth);

app.get('/',AuthController.homefunction);
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/member',memberRouter)
app.use('/api/v1/organization',organizationRouter)
app.use('/api/v1/seat/',seatRouter)
app.use('/api/v1/account/', accountRouter);
app.use('/api/v1/payment/', paymentRouter);

app.use('/testing', testingRouter );


app.set("view engine" , "ejs");
app.set("views", path.resolve('./views'));

app.listen(PORT,()=>{
    console.log( `server stared at ${PORT}...`)
})