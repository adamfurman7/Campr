const mongoose = require('mongoose');
const axios = require('axios');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

// const getImg = async () => {
// 	try {
// 		const response = await axios
// 			.get('https://api.unsplash.com/photos/random', {
// 				params: {
// 					client_id: '3DR6xoUrZAVGlwpzSYWTgCfMNEB6ZeCFj67C8WrWaOY',
// 					collections: '483251',
// 				},
// 			})
// 			.then((response) => {
// 				const data = JSON.parse(response);
// 				console.log(data.urls.regular);
// 				return data.urls.regular;
// 			});
// 		// .catch((error) => {
// 		//     console.log(error);
// 		// });
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		// const imgURL = getImg();
		const camp = new Campground({
			//YOUR USER ID
			author: '63e0676155d9bed75f3f6b10',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse sed temporibus enim voluptatibus eveniet! Cumque impedit vero odit quis, iure architecto? Sunt delectus sit ea odit ipsa, adipisci praesentium iste!',
			price,
			geometry: {
				type: 'Point',
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude,
				],
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dzik3qdi6/image/upload/v1675914068/Campr/sxsn1jpzbt1mlwotdsea.jpg',
					filename: 'Campr/sxsn1jpzbt1mlwotdsea',
				},
			],
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
