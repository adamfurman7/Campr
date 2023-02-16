const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary'); // node auotmatically looks for index.js file in folder
const upload = multer({ storage });

const Campground = require('../models/campground');
const { route } = require('./users');

router
	.route('/')
	.get(catchAsync(campgrounds.index))
	.post(
		isLoggedIn,
		upload.array('image'),
		validateCampground,
		catchAsync(campgrounds.createCampground)
	);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(campgrounds.showCampground))
	.put(
		isLoggedIn,
		isAuthor,
		upload.array('image'),
		validateCampground,
		catchAsync(campgrounds.updateCampground)
	)
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
