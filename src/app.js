import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';
import dayjs from 'dayjs';

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
mongoClient.connect()
    .then(() => {
        db = mongoClient.db();
        console.log('MongoDB conectado!')
    })
    .catch((err) => console.log(err.message));

//console.log(Number.isInteger(5.3));

const app = express();
app.use(cors());
app.use(express.json());

app.post('/sign-up', async (req, res) => {
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
        return res.status(422).send(errors);
    }
    try{
        const user = await db.collection('users').findOne({email: email});
        if(user) return res.status(409).send('O email já está cadastrado.');
        const passwordHash = bcrypt.hashSync(password, 10);
        await db.collection('users').insertOne({name: name, email: email, password: passwordHash});
        res.sendStatus(201);
    }catch (err){
        return res.status(500).send(err.message);
    }
});

app.post('/sign-in', async (req, res) =>{
    //body; {email: 'xxx@email.com', password: 'ixzdfbhzdsjbnf'}
    const {email, password} = req.body;
    const userSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    const validation = userSchema.validate(req.body, {abortEarly: false});
    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }
    try{
        const user = await db.collection('users').findOne({email: email});
        if(!user) return res.status(404).send('Email não cadastrado');
        if(bcrypt.compareSync(password, user.password)){
            const token = uuid();
            await db.collection('sessions').insertOne({userId: user._id, token: token});
            return res.status(200).send({name: user.name, token: token});
        }else{
            return res.status(401).send('Senha inválida!')
        }
    }catch (err){
        return res.status(500).send(err.message);
    }
})

app.post('/new-transaction/:type', async (req,res) =>{
    //headers: {'Authorization': `Bearer ${infProfi[0].token}`}
    //body: {value: 53.56, description: 'dinheiro para pagar a comida das criança'}
    //params: {type: 'income' ou 'outcome'}
    const {authorization} = req.headers;
    const {value, description} = req.body;
    const {type} = req.params
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.sendStatus(401);

    if (Number.isInteger(value)) return res.status(422).send('O valor deve estar no formato correto (ex. 52.6)');

    const transactionSchema = Joi.object({
        value: Joi.number().positive().required(),
        description: Joi.string().required(),
        type: Joi.any().valid('income', 'outcome').required()
    });

    const validation = transactionSchema.validate({ ...req.body, type: type }, {abortEarly: false});
    if(validation.error){
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try{
        const session = await db.collection('sessions').findOne({token: token});
        if(!session) return res.sendStatus(401);
        await db.collection('transactions').insertOne({
            userId: session.userId,
            type: type,
            value: value,
            description: description,
            date: Date.now()
        });
        return res.sendStatus(201);
    }catch (err){
        return res.status(500).send(err.message);
    } 
});

app.get('/my-transactions', async (req, res) =>{
    //headers: {'Authorization': `Bearer ${infProfi[0].token}`}
    const {authorization} = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    try{
        const session = await db.collection('sessions').findOne({token: token});
        if(!session) return res.status(401).send('Token não corresponde a nenhuma sessão');
        const transactions = await db.collection('transactions')
        .find({userId: session.userId})
        .sort({ date: -1 })
        .toArray();
        transactions.map(transaction => {
            delete transaction.userId;
        });
        return res.status(200).send(transactions);
    }catch(err){
        return res.status(500).send(err.message);
    }
})

app.delete('/sign-out', async (req,res) =>{
    //headers: {'Authorization': `Bearer ${infProfi[0].token}`}
    const {authorization} = req.headers;
    const token = authorization?.replace("Bearer ", "");
    try{
        const result = db.collection('sessions').deleteOne({token: token});
        if(result.deleteCount === 0) return res.sendStatus(404);
        return res.status(200).send('Loguot realizado com sucesso!');
    }catch (err){
        res.status(500).send(err.message);
    }
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`)
});