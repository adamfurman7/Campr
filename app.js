if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs'); // set view engine to ejs
app.set('views', path.join(__dirname, 'views')); // set the views directory

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
// protect against SQL injection
app.use(
	mongoSanitize({
		replaceWith: '_',
	})
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
	console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
	store,
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true, // only allows cookies over https
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/*',
	'https://kit.fontawesome.com',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net',
	'https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapies.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net',
	'self',
];
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://a.tiles.mapbox.com/',
	'https://b.tiles.mapbox.com/',
	'https://events.mapbox.com/',
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		useDefaults: true,
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			'script-src': ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			'style-src': ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`,
				'https://images.unsplash.com',
				'https://res.cloudinary.com/dzik3qdi6/image/upload/v1676563378/Campr/afwl2vzd72cushnbir17.jpg',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
			'script-src-attr': null,
			// 'style-src': ["'self'", "'unsafe-inline'", ...styleSrcUrls],
		},
	})
);

app.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	// console.log(req.session);
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong';
	res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`SERVING ON PORT ${port}`);
});
