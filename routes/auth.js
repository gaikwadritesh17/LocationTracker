const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user'); // Adjust the path if needed

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// Register route
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle registration form submission
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.redirect('/auth/login');
    } catch (err) {
        res.redirect('/auth/register');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/auth/login');
    });
});

module.exports = router;
