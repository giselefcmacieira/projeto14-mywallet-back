import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
export let db;
mongoClient.connect()
    .then(() => {
        db = mongoClient.db();
        console.log('MongoDB conectado!')
    })
    .catch((err) => console.log(err.message));

    