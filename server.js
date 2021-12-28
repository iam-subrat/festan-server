const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const { hashedpwd, authenticate } = require('./services/pwdServices');
const flash = require('connect-flash');
const helmet = require('helmet');

const customerRoutes = require('./routes/customer');
const apiRoutes = require('./routes/api');

const mongoSanitize = require('express-mongo-sanitize');

const config = require('./config/envConf')
config()

const storage = require('./config/fileStorageConf');
const multer = require('multer');
const upload = multer({ storage: storage });

const sessionConfig = require('./config/sessionConf');

const {connect, mongoose, close} = require('./services/dbInitClose');

let gfs;
connect();

const Grid = require('gridfs-stream');

mongoose.connection.once('open', function () {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
});

const methodOverride = require('method-override');

const PropOwner = require('./models/propOwner');
const EventProp = require('./models/eventProp');
const EventDetails = require('./models/eventDetails');
const BankAccount = require('./models/bankAccount');
const Customer = require('./models/customer');

const { sendOTP, resendOTP, authOTP } = require('./services/otpService');

const validateOTP = (req, res, next) => {
    // Code to validate OTP
    
    next();
}

const {checkOwner} = require('./middlewares/checkLocalUser')

const reqInfo = require('./middlewares/debugMsg')

// Throws error if input validation fails
const { registerFormValidation, loginFormValidation, ownerProfileFormValidation, propertyFormValidation, bankAccountFormValidation, accountFormValidation } = require('./services/inputValidation');
const inputValidationResult = require('./middlewares/valResult');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//to access the public folder from anywhere directly
app.use(express.static(path.join(__dirname, 'public')));

//to get POST data
app.use(express.urlencoded({ extended: true }));

//to parse and fetch json data
app.use(express.json());

//remove or sanitize $ or . to prevent noSQL injection
app.use(mongoSanitize({
    replaceWith: '_',
    //report on console if anything is sanitized
    onSanitize: ({ req, key }) => {
      console.warn(`This request[${key}] is sanitized`, req);
    }
}));

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "http://gc.kis.v2.scr.kaspersky-labs.com/",
    "https://ajax.googleapis.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "http://gc.kis.v2.scr.kaspersky-labs.com/",
    "https://maxcdn.bootstrapcdn.com/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
];
const fontSrcUrls = [
    "https://fonts.gstatic.com/"
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//to override POST request for DELETE, PUT, PATCH etc.
app.use(methodOverride('_method'));

app.use(session(sessionConfig));

app.use(flash());

app.use(reqInfo)

app.use(async (req, res, next) => {
    console.log('session: ', req.session);
    try {
        if (req.session && req.session.role === 'owner') {
            res.locals.user = await PropOwner.findOne({ _id: req.session.userId });
            res.locals.user.role = 'owner';
        } else if (req.session && req.session.role === 'customer') {
            res.locals.user = await Customer.findOne({ _id: req.session.userId });
            res.locals.user.role = 'customer';
        }
    } catch (err) {
        console.log(err);
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.proptypes = ['B\'day', 'Engagement', 'Wedding', 'Thread Ceremony', 'Puja Function', 'Get-together', 'Party'];
    res.locals.services = ['Cooking utensils', 'Internal Catering', 'External Catering', 'Parking', 'Decoration'];
    next();
})

app.use('/api', apiRoutes);

app.use('/customer', customerRoutes);

app.get('/', async (req, res) => {
    if (res.locals.user)
        res.redirect('/dashboard');
    else
        res.render('index');
});

app.get('/register', (req, res) => {
    if (res.locals.user)
        req.session.destroy();
    else
        res.render('register');
});

app.put('/register', 
        registerFormValidation,
        inputValidationResult,
        validateOTP,
        async (req, res) => {
            try {
                if (req.body.password == req.body.password_repeat) {
                    const pwdigest = await hashedpwd(req.body.password);
                    const user = new PropOwner({
                        fname: req.body.first_name.toUpperCase(),
                        lname: req.body.last_name.toUpperCase(),
                        email: req.body.email.toLowerCase(),
                        phone: req.body.phone,
                        pan: req.body.pan.toUpperCase(),
                        password: pwdigest
                    })
                    await user.save();
                    req.session.userId = user._id;
                    req.session.role = 'owner';
                    req.flash('success', 'Successfully registered.');
                    res.redirect('/dashboard');
                } else
                    throw new Error('Password and repeat password do not match.');
            } catch (err) {
                console.log(err);
                req.flash('error', err.message);
                res.redirect('/register');
            }
        })

app.get('/login', (req, res) => {
    if (res.locals.user)
        req.session.destroy();
    else
        res.render('login');
});

app.post('/login',
        loginFormValidation,
        inputValidationResult,
        async (req, res) => {
            try {
                const pwd = req.body.password;
                const user = await PropOwner.findOne({ email: req.body.email.toLowerCase() });
                if (user) {
                    const verified = await authenticate(user, pwd);
                    if (!verified)
                        throw new Error('Missing/Invalid username or password.');
                    else {
                        req.session.userId = user._id;
                        req.session.role = 'owner';
                        req.flash('success', 'Welcome back.');
                        res.redirect('/dashboard');
                    }
                }
                else
                    throw new Error('Missing/Invalid username or password.');
            } catch (err) {
                console.log(err);
                req.flash('error', err.message);
                res.redirect('/login');
            }
        });

app.use(checkOwner);

app.get('/dashboard', async (req, res) => {
    try {
        const prop = await EventProp.findOne({ ownerid: req.session.userId });
        let upcomingEvents = [];
        if (prop) {
            const events = await EventDetails.find({ propId: prop._id });
            if (events) {
                upcomingEvents = events.filter(e => new Date(e.eventDate) >= Date.now()).sort((a, b) => {
                    const datediff = new Date(a.eventDate) - new Date(b.eventDate);
                    const timediff = a.eventTime<=b.eventTime ? -1 : 1;
                    return datediff + timediff;
                });
                upcomingEvents = await Promise.all(upcomingEvents.map(async e => {
                    const customer = await Customer.findOne({ _id: e.userId });
                    if (customer)
                        return { ...e._doc, 
                            customerName: customer.name, 
                            customerEmail: customer.email, 
                            customerPhone: customer.phone 
                        };
                    else
                        return e;
                }));
            }
        }
        res.render('dashboard', {upcomingEvents});
    } catch (err) {
        console.log(err);
        req.flash('error', err.message);
        res.redirect('/login');
    }
});

app.get('/profile', async (req, res) => {
    try {
        const prop = await EventProp.findOne({ ownerid: res.locals.user._id })
        const account = await BankAccount.findOne({ ownerid: res.locals.user._id })
        res.render('profile', { prop, account });
    }
    catch (err) {
        console.log(err);
        req.session.destroy();
        res.redirect('/');
    }
});

app.post('/profile/owner',
        ownerProfileFormValidation,
        inputValidationResult,
        async (req, res) => {
            try {
                await PropOwner.findOneAndUpdate({ _id: res.locals.user._id }, {
                    fname: req.body.first_name.toUpperCase(),
                    lname: req.body.last_name.toUpperCase(),
                    email: req.body.email.toLowerCase(),
                    pan: req.body.pan_num.toUpperCase(),
                    phone: req.body.phone
                }, { new: true, runValidators: true });
                
                req.flash('success', 'Updated successfully.')
            } catch (err) {
                console.log(err);
                req.flash('error', err.message);
            }
            res.redirect('/profile');
        });

app.post('/profile/prop',
        upload.array('images', 5),
        propertyFormValidation,
        inputValidationResult,
        async (req, res) => {
            console.log(req.body.allowBooking);
            const newimages = req.files.map(file => ({ url: `${process.env.SERVER_DOMAIN}/api/image/props/${file.filename}`, filename: file.filename }));
            try {
                const ftype = res.locals.proptypes.filter(type => req.body[type]);
                const services = res.locals.services.filter(service => req.body[service]);
                
                const update = await EventProp.findOneAndUpdate({ ownerid: res.locals.user._id }, {
                    ownerid: res.locals.user._id,
                    name: req.body.propname.toUpperCase(),
                    location: { longitude: req.body.longitude, latitude: req.body.latitude, address: req.body.address.toUpperCase(), city: req.body.city.toUpperCase(), state:req.body.state.toUpperCase(), pincode: req.body.pincode },
                    contact: req.body.contact,
                    mailid: req.body.mailid,
                    officeHours: req.body.officeHours,
                    size: req.body.size.replace(/[^0-9]/g, ''),
                    allowBooking: req.body.allowBooking,
                    capacity: req.body.capacity.replace(/[^0-9]/g, ''),
                    price: req.body.cost.replace(/[^0-9]/g, ''),
                    functiontype: ftype,
                    service: services,
                    cctv: req.body.cctv,
                    dressingRoom: req.body.dressingRoom,
                    description: req.body.desc
                }, { upsert: true, new: true, runValidators: true });
                const deleteImages = [];
                for (let image of update.images) {
                    if (req.body[image.filename]) {
                        await gfs.files.deleteOne({ filename: image.filename });
                        deleteImages.push(image.filename);
                    }
                }
                const oldimages = update.images.filter((image) => !deleteImages.includes(image.filename));
                update.images = [...oldimages||[], ...newimages||[]];
                if (update.images.length>5) {
                    const removeImages = update.images.slice(5).map(image => image.filename);
                    update.images = update.images.slice(0, 5);
                    for (let imagename of removeImages)
                        await gfs.files.deleteOne({ filename: imagename });
                }
                await update.save();
                req.flash('success', 'Updated successfully.')
            } catch (err) {
                for (let image of newimages) {
                    await gfs.files.deleteOne({ filename: image.filename });
                }
                console.log(err);
                req.flash('error', err.message);
            }
            res.redirect('/profile');
        });

app.post('/profile/bankaccount', 
        bankAccountFormValidation,
        inputValidationResult,
        async (req, res) => {
            try {
                await BankAccount.findOneAndUpdate({ ownerid: res.locals.user._id }, {
                    ownerid: res.locals.user._id,
                    name: req.body.acholdername.toUpperCase(),
                    accno: req.body.acnum,
                    ifsc: req.body.ifsc.toUpperCase()
                }, { upsert: true, new: true, runValidators: true });
                req.flash('success', 'Updated successfully.');
            } catch (err) {
                console.log(err);
                req.flash('error', err.message);
            }
            res.redirect('/profile');
        });

app.get('/bookings', async (req, res) => {
    try {
        const prop = await EventProp.findOne({ ownerid: req.session.userId });
        let events = []
        if (prop) {
            events = await EventDetails.find({ propId: prop._id });
            if (events) {
                events = await Promise.all(events.map(async e => {
                    const customer = await Customer.findOne({ _id: e.userId });
                    if (customer)
                        return { ...e._doc, 
                            customerName: customer.name, 
                            customerEmail: customer.email, 
                            customerPhone: customer.phone,
                            totalPayment: prop.price,
                        };
                    else
                        return e;
                }));
                events = events.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
            }
        }
        res.render('bookings', { events });
    } catch(err) {
        console.log(err);
        req.flash('error', err.message);
        res.redirect('/');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/account', (req, res) => {
    res.render('account');
});

app.post('/account',
        accountFormValidation,
        inputValidationResult,
        async (req, res) => {
            try {
                if (req.body.newpassword==req.body.passwordrepeat) {
                    const user = res.locals.user;
                    const pwd = req.body.password;
                    const verified = await authenticate(user, pwd);
                    if (verified) {
                        const newpwdigest = await hashedpwd(req.body.newpassword);
                        await PropOwner.findOneAndUpdate({ _id: user._id }, { password: newpwdigest }, { new: true, runValidators: true });
                        req.flash('success', 'Password updated.');
                    }
                    else
                        throw new Error('Unable to authenticate.');
                }
                else
                    throw new Error('New and repeat passwords do not match.');
            } catch(err) {
                console.log(err);
                req.flash('error', err.message);
            }
            res.redirect('/account');
        })

app.delete('/account/delete', async (req, res) => {
    try {
        const userId = res.locals.user._id;
        const user = await PropOwner.findOne({ _id: userId });
        const props = await EventProp.find({ ownerid: userId });
        const verified = await authenticate(user, req.body.pwd);
        if (verified) {
            console.log('Deleting account...');
            for (let prop of props) {
                for (let image of prop.images)
                    await gfs.files.deleteOne({ filename: image.filename });
            }
            await PropOwner.deleteOne({ _id: userId });
            await EventProp.deleteMany({ ownerid: userId });
            await BankAccount.deleteMany({ ownerid: userId });
            req.session.destroy();
            console.log('Account deleted');
            res.redirect('/');
        }
        else
            throw new Error('Failed to delete account. Could not authenticate user.');
    } catch (err) {
        console.log(err);
        req.flash('error', err.message);
        res.redirect('/account');
    }
})

//to connect and listen to port 8080
app.listen(process.env.PORT, () => {
    console.log('Listening to port...');
});
