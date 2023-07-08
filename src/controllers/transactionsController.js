import {db} from '../database/databaseConnection.js';

export async function userTransactions (req, res) {
    const {session} = res.locals;
    try{
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
}

export async function addTransaction (req,res) {
    const {value, description} = req.body;
    const {type} = res.locals;
    const {session} = res.locals;

    if (!value.toString().includes('.')) return res.status(422).send('O valor deve estar no formato correto (ex. 52.6)');

    try{
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
}