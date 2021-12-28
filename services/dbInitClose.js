const mongoose = require('mongoose');

//to connect to MongoDB and use database "test"
const connect = async () => {
    await mongoose.connect(process.env.DB_PATH, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
        .then(() => {
            console.log('Connected to database');
        })
        .catch((err) => {
            console.log('Error connecting to database: ', err.message);
        });
}

module.exports = {
    mongoose,
    connect: connect,
    close: mongoose.connection.close
}