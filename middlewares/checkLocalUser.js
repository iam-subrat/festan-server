function checkUser (req, res, next) {
    if (res.locals.user)
        next();
    else
        res.status(401).send('Error 401');
}

function checkOwner (req, res, next) {
    if (res.locals.user && res.locals.user.role=='owner')
        next();
    else
        res.redirect('/');
}

function checkCustomer(req, res, next) {
    if (res.locals.user && res.locals.user.role=='customer')
        next();
    else
        res.status(401).send('Error 401');
}

module.exports = { checkUser, checkOwner, checkCustomer };