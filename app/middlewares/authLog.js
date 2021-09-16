const jwt = require('jsonwebtoken');

/* Vérification du token */
const authLog = (req, res, next) => {
    // Récupération du token
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    // Présence d'un token
    if (!token) {
        return res.status(401).json({ message: 'Error. Need a token' });
    }

    // Véracité du token
    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
        if (err) {
            jwt.verify(token, process.env.REFRESH_SECRET, (err, decodedRefreshToken) => {
                if(err){
                    res.status(401).json({ message: 'Error. Bad token' });
                }else{
                    delete decodedRefreshToken.iat;
                    delete decodedRefreshToken.exp;
                    req.userRefreshToken = decodedRefreshToken;
                    return next();
                }
            });
        } else {
            req.userLogged = decodedToken;
            return next();
        }
    });
}

module.exports = authLog;