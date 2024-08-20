const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const Location = require('./models/Location');
const User = require('./models/user');
const authRoutes = require('./routes/auth');
const historyRoutes = require('./routes/history');
const { ensureAuthenticated } = require('./middleware/auth');  // Import the middleware

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/location-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Passport Configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    const user = await User.findOne({ username });
    if (user && user.password === password) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect credentials.' });
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/history', historyRoutes);

// Protected Route
app.get('/', ensureAuthenticated, (req, res) => {
  res.render('index');  // Render the map page only if authenticated
});

// Socket.io Handling
io.on('connection', (socket) => {
  socket.on('send-location', async (data) => {
    const location = new Location({
      userId: socket.id,
      latitude: data.latitude,
      longitude: data.longitude,
    });
    await location.save();

    io.emit('receive-location', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    io.emit('user-disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
