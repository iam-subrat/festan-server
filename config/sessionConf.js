const MongoStore = require("connect-mongo");

const daysToMillis = (days = 1) => 1000 * 60 * 60 * 24 * days;

const sessionConfig = {
    name: "user-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_PATH,
        touchAfter: daysToMillis() / 1000,
    }),
    cookie: {
        maxAge: daysToMillis(7),
        secure: process.env.NODE_ENV?.toLowerCase() === "production",
        sameSite:
            process.env.NODE_ENV?.toLowerCase() === "production"
                ? "none"
                : "lax",
        httpOnly: true,
    },
};

module.exports = sessionConfig;
