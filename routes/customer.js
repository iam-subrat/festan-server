const express = require("express");
const router = express.Router();

const EventProp = require("../models/eventProp");
const EventDetails = require("../models/eventDetails");
const Customer = require("../models/customer");

const { hashedpwd, authenticate } = require("../services/pwdServices");
const { checkCustomer } = require("../middlewares/checkLocalUser");

const cors = require("cors");

router.use(
  cors({
    origin: true,
    methods: ["GET", "OPTIONS", "HEAD", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const encryptedpwd = await hashedpwd(password);
    console.log("Encrypted pwd");
    const customer = new Customer({
      name,
      email,
      phone,
      password: encryptedpwd,
    });
    console.log("Customer created");
    await customer.save();
    console.log("Customer saved", customer);
    req.session.userId = customer._id;
    req.session.role = "customer";
    res.json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("session: ", req.session);
    const { username, password } = req.body;
    const customer = parseInt(username)
      ? (await Customer.findOne({ phone: username })) ||
        (await Customer.findOne({ email: username }))
      : await Customer.findOne({ email: username });
    if (customer) {
      if (authenticate(customer, password)) {
        req.session.userId = customer._id;
        req.session.role = "customer";
        console.log("session: ", req.session);
        res.json({ message: "success" });
      } else {
        throw new Error("Wrong email or password");
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.use(checkCustomer);

router.get("/current-user", async (req, res) => {
  try {
    console.log("Current user", req.session.userId);
    const customer = await Customer.findOne({ _id: req.session.userId });
    console.log("Current user", customer);
    res.json(customer);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/event-bookings/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    if (userId) {
      const bookings = await EventDetails.find({ userId });
      return res.json({
        bookings: bookings.sort((a, b) =>
          a.bookingDate < b.bookingDate
            ? 1
            : a.bookingDate > b.bookingDate
            ? -1
            : 0
        ),
      });
    } else {
      throw new Error("Invalid request");
    }
  } catch (err) {
    return res.json({ error: err });
  }
});

router.post("/request-booking", async (req, res) => {
  const { propId: propId, eventDate, eventTime, type } = req.body;
  try {
    const prop = await EventProp.findOne({ _id: propId });
    if (!prop) throw new Error("Property not found.");
    console.log(eventDate);
    const eventBooking = new EventDetails({
      userId: res.locals.user._id,
      propId,
      eventDate: new Date(eventDate),
      eventTime,
      bookingDate: new Date(),
      type,
    });
    await eventBooking.save();
    console.log("Event booking", eventBooking);
    res.json({ message: "Successfully sent request" });
  } catch (err) {
    res.json({ message: "Failed to send request", error: err.message });
  }
});

router.post("/logout", async (req, res) => {
  req.session.destroy();
  res.json({ message: "success" });
});

module.exports = router;
