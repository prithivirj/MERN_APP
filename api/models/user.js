const mongoose = require('mongoose');

const Users = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    mobileNo: String
}, {
        timestamps: true
    });

module.exports = mongoose.model('Users', Users);