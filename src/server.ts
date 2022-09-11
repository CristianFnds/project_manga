import express, { request, response } from 'express';
import { routes } from './routes';
import  path  from 'path';

const app = express();
const cors = require('cors');


app.use(express.static(path.join(__dirname, 'public/assets')));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'view'))


app.use(express.json());
app.use(express.text());

app.use(routes);
app.use(cors());

app.listen(3333,()=>console.log("Server is running on port 3333")); 