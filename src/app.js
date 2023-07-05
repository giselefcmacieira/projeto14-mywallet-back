import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import Joi from 'joi';
import bcrypt from 'bcrypt';

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

app.post('/cadastro', async (req, res) => {
    // body: {name: 'xxxx', email: ''aaa@ffff', password: 'xlcvbnipsaudebnj'}
    const {name, email, password} = req.body;
    const newUserSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(3).required()
    });
    const validation = newUserSchema.validate(req.body, {abortEarly: false});
    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        console.log(errors);
        return res.status(422).send(errors);
    }
    try{
        const user = await db.collection('users').findOne({email: email});
        if(user) return res.status(409).send({message: 'O email já está cadastrado.'});
        const passwordHash = bcrypt.hashSync(password, 10);
        await db.collection('users').insertOne({name: name, email: email, password: passwordHash});
        res.sendStatus(201);
    }catch (err){
        return res.status(500).send(err.message);
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`)
});