const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const connectToDB = require("./connectToDB");
const userModel = require("./user.model");
module.exports = async (socket, next) => {
    console.log(`Socket : `, socket);
    const cookieHeader = socket.handshake.headers.cookie;
    console.log(
        "Handshake headers : ", socket.handshake.headers.cookie
    );
    console.log("Cookies : ", socket.cookies)
    if (!cookieHeader) {
        console.log("Authentication required!");
        return next(new Error("Authentication required!"));
    }
    const cookies = cookie.parse(cookieHeader);
    const authToken = cookies.authToken;
    if (!authToken) {
        console.log("Token missing");
        return next(new Error("Token missing"));
    }
    const SECRET_KEY = process.env.SECRET_KEY;
    if (!SECRET_KEY) {
        console.log("Secret Key is missing");
        return next(new Error("Secret Key is missing"));
    }
    try {
        const decoded = jwt.verify(authToken, SECRET_KEY);
        await connectToDB();
        const user = await userModel.findById(decoded.userId).select("-password -email -allowed -createdAt -updatedAt -paymentStatus -profilepic");
        if (!user) {
            console.log("User not found");
            return next(new Error("User not found"));
        }
        socket.user = {
            _id: decoded.userId,
        };
    } catch (error) {
        console.log(error);
        console.log("Authentication failed");
        return next(new Error("Authentication failed"));
    }
    return next();
};