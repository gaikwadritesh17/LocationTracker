// middleware/auth.js
module.exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');  // Redirect to login page if not authenticated
};
