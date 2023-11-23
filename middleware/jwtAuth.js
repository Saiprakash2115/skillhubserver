const jwt = require("jsonwebtoken");

module.exports = function(req, res, next){
    try{
        
      let token = req.header("token");
   
        if(!token)
        {
            return res.status(400).json("JWT token not found")
        }
        let compareToken = jwt.verify(token, "jwtPassword");
        req.employeeId = compareToken.user; // comparing requested user and logged in user
        
        
        next()
    }
    
    catch(e){
        console.log(e);
        return resizeBy.status(500).json("internal server error");
}
}