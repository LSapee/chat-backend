import jwt  from 'jsonwebtoken';
import * as process from 'node:process';
export const generateToken = (userId)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
      expiresIn:"7d"
    })
    return token;
}
