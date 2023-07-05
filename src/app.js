import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
mongoClient.connect()
    .then(() => {
        db = mongoClient.db();
        console.log('MongoDB conectado!')
    })
    .catch((err) => console.log(err.message));


const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`)
});