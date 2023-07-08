import {db} from '../database/databaseConnection.js';

export async function validateToken (req, res, next){
    
    const {authorization} = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if(!token) return res.sendStatus(401);
    try{
        const session = await db.collection('sessions').findOne({token: token});
        if(!session) return res.status(401).send('Token não corresponde a nenhuma sessão');
        res.locals.session = session;
    }catch (err){
        res.status(500).send(err.message);
    }
    

    next();
    
}