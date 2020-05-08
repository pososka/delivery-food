'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cards-menu");
const restaurantTitle = document.querySelector(".restaurant-title");
const rating = document.querySelector(".rating");
const minPrice = document.querySelector(".price");
const category = document.querySelector(".category");
const inputSearch = document.querySelector(".input-search");
const modalBody = document.querySelector(".modal-body");
const modalPrice = document.querySelector(".modal-pricetag");
const clearCart = document.querySelector(".clear-cart");

let login = localStorage.getItem('user');
const cart = JSON.parse(localStorage.getItem('cart')) || [];

const getData = async function (uri) {
	const response = await fetch(uri);

	if (false == response.ok) {
		throw new Error(`Ошибка по адресу ${url}, статус ${response.status}!`)
	}

	return await response.json();
}

const valid = function(str) {
	const nameReg = new RegExp('^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$');
	return nameReg.test(str);
}

function toggleModal() {
	modal.classList.toggle("is-open");
}

function toggleModalAuth() {
	modalAuth.classList.toggle("is-open");
}

function returnMain() {
	containerPromo.classList.remove('hide');
	restaurants.classList.remove('hide');
	menu.classList.add('hide');
}

function authorize() {
	function logOut(event) {
		login = null;

		localStorage.removeItem('user');
		buttonOut.removeEventListener("click", logOut);
		checkAuth();

		buttonAuth.style.display = '';
		userName.style.display = '';
		buttonOut.style.display = '';
		cartButton.style.display = '';
	// checkAuth();
		returnMain();
	}

	console.log('Авторизован');

	userName.textContent = login;

	buttonAuth.style.display = 'none';
	userName.style.display = 'inline';
	buttonOut.style.display = 'flex';
	cartButton.style.display = 'flex';

	buttonOut.addEventListener("click", logOut);
}

function notAuthorize() {
	console.log('Не авторизован');

	function logIn(event) {
		event.preventDefault();
		
		if (false == valid(loginInput.value)) {
			loginInput.style.outline = '1px auto red';

			if (false == loginInput.classList.contains('animated')) {
				loginInput.classList.add('animated');
				loginInput.classList.add('shake');

				setTimeout(function () {
					loginInput.classList.remove('animated');
					loginInput.classList.remove('shake');
				}, 1000);
			}

			return;
		}

		loginInput.style.outline = '';
		loginInput.classList.remove('animated');
		loginInput.classList.remove('shake');

		login = loginInput.value;
		localStorage.setItem('user', login);

		toggleModalAuth();

		buttonAuth.removeEventListener("click", toggleModalAuth);
		closeAuth.removeEventListener("click", toggleModalAuth);
		logInForm.removeEventListener("submit", logIn);
		logInForm.reset();

		checkAuth();
	}

	buttonAuth.addEventListener("click", toggleModalAuth);
	closeAuth.addEventListener("click", toggleModalAuth);
	logInForm.addEventListener("submit", logIn);
}

function checkAuth() {
	if (login) {
		authorize();
	} else {
		notAuthorize();
	}
}

function createCardRestaurant({ image, kitchen, name, price, stars, products,
	time_of_delivery : timeOfDelivery }) {

	const card = document.createElement('a');
	card.className = 'card card-restaurant';
	card.products = products;
	card.info = [name, price, stars, kitchen];

	card.insertAdjacentHTML('beforeend', `
		<img src="${image}" alt="image" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title">${name}</h3>
				<span class="card-tag tag">${timeOfDelivery} мин</span>
			</div>
			<div class="card-info">
				<div class="rating">${stars}</div>
				<div class="price">От ${price} ₽</div>
				<div class="category">${kitchen}</div>
			</div>
		</div>
	`);

	cardsRestaurants.insertAdjacentElement('beforeend', card);
}

function createCardGoods({ description, id, image, name, price }) {
	const card = document.createElement('div');
	card.className = 'card';
	card.id = id;
	card.name = name;
	card.price = price;
	card.insertAdjacentHTML('beforeend', `
		<img src="${image}" alt="image" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title card-title-reg">${name}</h3>
			</div>
			<div class="card-info">
				<div class="ingredients">${description}</div>
			</div>
			<div class="card-buttons">
				<button class="button button-primary button-add-cart">
					<span class="button-card-text">В корзину</span>
					<span class="button-cart-svg"></span>
				</button>
				<strong class="card-price card-price-bold ">${price} ₽</strong>
			</div>
		</div>
	`);

	cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods(event) {
	
	const target = event.target;
	const restaurant = target.closest('.card-restaurant');
	
	if (restaurant) {
		if (null == login) {
			toggleModalAuth();
			return;
		}

		cardsMenu.textContent = '';
		containerPromo.classList.add('hide');
		restaurants.classList.add('hide');
		menu.classList.remove('hide');

		const [ name, price, stars, kitchen ] = restaurant.info;

		restaurantTitle.textContent = name;
		rating.textContent = stars;
		minPrice.textContent = `От ${price} ₽`;
		category.textContent = kitchen;

		getData(`../db/${restaurant.products}`).then(function (data) {
			data.forEach(createCardGoods);
		});
	}
}

function searchGoods(event) {
	if (event.keyCode == 13) {
		const target = this;
		const value = new RegExp( target.value.trim(), 'i' );
		target.value = '';
		const goods = [];

		if (!value || value.length <= 2) {
			target.style.outline = '1px auto red';

			setTimeout(function () {
				target.style.outline = '';
			}, 2000);

			return;
		}

		getData('../db/partners.json').then(function (data) {
			const products = data.map(function (item) {
				return item.products;
			});

			products.forEach(function (product) {
				getData(`../db/${product}`).then(function (data) {
					goods.push(...data);

					const filterGoods = goods.filter(function (item) {
						return item.name.search(value) > -1;
					});

					cardsMenu.textContent = '';
					containerPromo.classList.add('hide');
					restaurants.classList.add('hide');
					menu.classList.remove('hide');

					restaurantTitle.textContent = 'Результат поиска';
					rating.textContent = '';
					minPrice.textContent = '';
					category.textContent = '';
					
					return filterGoods;
				}).then(function (data) {
					data.forEach(createCardGoods);
				});
			});
		});
	}
}

function addToCart(event) {
	const target = event.target;
	const buttonAddToCart = target.closest('.button-add-cart');

	if (buttonAddToCart) {
		const card = target.closest('.card');
		const title = card.name;
		const cost = card.price;
		const id = card.id;

		const food = cart.find(function (item) {
			return item.id === id;
		});

		if (food) {
			food.count += 1;
		} else {
			cart.push({
				id,
				title,
				cost,
				count: 1
			});
		}

		console.log(cart);

		localStorage.setItem('cart', JSON.stringify(cart));
	}
}

function renderCart() {
	modalBody.textContent = '';

	cart.forEach(function ({ id, title, cost, count }) {
		const itemCart = `
			<div class="food-row">
				<span class="food-name">${title}</span>
				<strong class="food-price">${cost} ₽</strong>
				<div class="food-counter">
					<button class="counter-button counter-minus" data-id="${id}">-</button>
					<span class="counter">${count}</span>
					<button class="counter-button counter-plus" data-id="${id}">+</button>
				</div>
			</div>
		`;

		modalBody.insertAdjacentHTML('beforeend', itemCart);
	});

	const totalPrice = cart.reduce(function (result, item) {
		return result + parseFloat(item.cost) * item.count;
	}, 0);

	modalPrice.textContent = `${totalPrice} ₽`;
}

function changeCount(event) {
	const target = event.target;
	
	if (target.classList.contains('counter-button')) {
		const food = cart.find(function (item) {
			return item.id === target.dataset.id;
		});
		
		if (target.classList.contains('counter-minus')) {
			food.count--;
			if (food.count == 0) {
				cart.splice(cart.indexOf(food), 1);
			}
		}
	
		if (target.classList.contains('counter-plus')) {
			food.count++;
		}
	
		localStorage.setItem('cart', JSON.stringify(cart));
		renderCart();
	}
}

function init() {
	getData('../db/partners.json').then(function (data) {
		data.forEach(createCardRestaurant);
	});
	cartButton.addEventListener("click", function () {
		renderCart();
		toggleModal();
	});
	clearCart.addEventListener('click', function () {
		cart.length = 0;
		localStorage.removeItem('cart');
		renderCart();
	});
	close.addEventListener("click", toggleModal);
	cardsRestaurants.addEventListener('click', openGoods);
	logo.addEventListener('click', returnMain);
	inputSearch.addEventListener('keydown', searchGoods);
	cardsMenu.addEventListener('click', addToCart);
	modalBody.addEventListener('click', changeCount);
	
	checkAuth();
	
	new Swiper('.swiper-container', {
		loop: true,
		speed: 1000,
		autoplay: {
			delay: 5000,
		},
	});
}

init();
