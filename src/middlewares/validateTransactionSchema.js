import { transactionSchema } from "../schemas/transactionSchema.js";

export function validateTransactionSchema (req, res, next){
        const {type} = req.params;
        
        const validation = transactionSchema.validate({ ...req.body, type: type }, {abortEarly: false});
        if(validation.error){
            const errors = validation.error.details.map(detail => detail.message);
            return res.status(422).send(errors);
        }

        res.locals.type = type;

        next();
}