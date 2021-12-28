async function reqInfo(req, res, next) {
    req.requestTime = Date.now();
    console.log(`\nRequest timestamp: ${new Date(req.requestTime)}`);
    console.log(`Requested page: ${req.originalUrl}`);
    next();
}

module.exports = reqInfo;