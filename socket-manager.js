// Hash map that stores all the socket IDs of a User in the form of a set : 
const userToSockets = new Map();
// Hash map that stores which socket ID belongs to which user : 
const socketToUser = new Map();
module.exports = {
    userToSockets, socketToUser
};