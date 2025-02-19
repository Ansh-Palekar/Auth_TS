const jwt=require("jsonwebtoken");
const path=require("path");



function protectRoute(req,res,next){
    const token = req.cookies.token;

    // If no token is found
    if (!token) {
        next();
    }

    // Verify the token
    jwt.verify(token, "ansh", (err, decoded) => {
        if (err) {
            return res.sendFile(path.join(__dirname, "../public/login.html"));
        }
        // Store the decoded data (user's info) in the request object
        req.user = decoded;
        return res.redirect("/main"); // Proceed to the next middleware or route handler
    });
};

module.exports=protectRoute;
