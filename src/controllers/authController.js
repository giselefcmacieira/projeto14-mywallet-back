import {db} from '../database/databaseConnection.js';
import bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';

export async function singUp (req, res) {
    // body: {name: 'xxxx', email: ''aaa@ffff', password: 'xlcvbnipsaudebnj'}
    const {name, email, password} = req.body;

    try{
        const user = await db.collection('users').findOne({email: email});
        if(user) return res.status(409).send('O email já está cadastrado.');
        const passwordHash = bcrypt.hashSync(password, 10);
        await db.collection('users').insertOne({name: name, email: email, password: passwordHash});
        res.sendStatus(201);
    }catch (err){
        return res.status(500).send(err.message);
    }
}

export async function signIn (req, res) {
    //body; {email: 'xxx@email.com', password: 'ixzdfbhzdsjbnf'}
    const {email, password} = req.body;
    
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
}

export async function signOut (req,res) {
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
}