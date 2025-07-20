const MongoStore = require("connect-mongo");

const weekinmillis = (weeks = 1) => 1000 * 60 * 60 * 24 * 7 * weeks;

const sessionConfig = {
    name: "user-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_PATH }),
    cookie: {
        maxAge: weekinmillis(),
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
    },
};

module.exports = sessionConfig;
