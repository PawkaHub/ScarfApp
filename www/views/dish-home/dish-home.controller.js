(function() {
	'use strict';

	function DishHomeController($log, $timeout, $firebaseObject, $firebaseArray, $cordovaSms, FURL, User, dishTimer, dishCards, dishMapSelect, dishTimeSelect, dishSignup) {
		var vm = this;
		var mealsUrl = FURL + '/meals';
		var mealsRef = new Firebase(mealsUrl).orderByChild('published').equalTo(true);
		vm.meals = $firebaseArray(mealsRef);
		var profileUrl = FURL + '/profile/';

		vm.currentUser = User.user;

		window.User = User;

		vm.mealsLoaded = false;

		var linkProfile = function(meal) {
			var profileRef = new Firebase(profileUrl + meal.cookId);
			meal.cook = $firebaseObject(profileRef);
		};

		vm.meals.$watch(function(event) {
			//Relink the changed meal's profile
			var meal = vm.meals.$getRecord(event.key);
			//$log.log('meals changed!', event, meal);
			if (event.event !== 'child_removed') {
				linkProfile(meal);
			}
			window.meals = vm.meals;
			//Sort the meals by date, and reverse them to order by most recent
			/*vm.meals.sort(function(a, b) {
				return a.time - b.time;
			});
			$log.log('sorted meals', vm.meals);*/
		});

		vm.meals.$loaded().then(function(meals) {
			//$log.log('loaded', meals);
			window.meals = meals;
			vm.mealsLoaded = true;
		}).catch(function(error) {
			$log.log('error', error)
		});

		//Sync up with Dish's internal clock
		dishTimer.watch(function(time) {
			//$log.log('timeChanged', time);
			$timeout(function() {}); //Force a digest
			vm.time = time;
			vm.time.formatted = time.moment.format('dddd h:mma');
		});

		//Show Empty Notice
		vm.showEmpty = function() {
			if (!vm.mealsLoaded) return false;
			//Handle hidden meals that have been filtered by time/location
			var hidden = _.where(vm.meals, {
				hidden: true
			});
			//$log.log('hidden', hidden.length, vm.meals.length);
			if (hidden.length !== vm.meals.length) return false;
			if (dishMapSelect.active) return false;
			if (dishTimeSelect.active) return false;
			if (dishSignup.active) return false;
			return true;
		};

		//Show Loading
		vm.showLoading = function() {
			if (vm.mealsLoaded) return false;
			if (dishMapSelect.active) return false;
			if (dishTimeSelect.active) return false;
			if (dishSignup.active) return false;
			return true;
		};

		//Show Header
		vm.showHeader = function() {
			if (dishMapSelect.active) return false;
			return true;
		};

		//Hide Header
		vm.hideHeader = function() {
			if (dishSignup.active) return true;
			return false;
		};

		//Show SubHeader
		vm.showSubHeader = function() {
			if (dishTimeSelect.active || !dishMapSelect.active) return false;
			return true;
		};

		//Hide SubHeader
		vm.hideSubHeader = function() {
			if (dishSignup.active) return true;
			return false;
		};

		//Show Nav
		vm.showNav = function() {
			if (dishMapSelect.active) return false;
			if (dishTimeSelect.active) return false;
			if (dishSignup.active) return false;
			return true;
		};

		//Show Close Button
		vm.showClose = function() {
			if (dishMapSelect.active) return true;
			if (dishTimeSelect.active) return true;
			if (dishSignup.active) return true;
			return false;
		};

		//Show Cards
		vm.showCards = function() {
			if (dishMapSelect.active) return false;
			if (dishTimeSelect.active) return false;
			if (dishSignup.active) return false;
			return true;
		};

		//Show Footer
		vm.showFooter = function() {
			if (dishMapSelect.active) return false;
			if (dishTimeSelect.active) return false;
			if (dishSignup.active) return false;
			return true;
		};

		//Show Card
		vm.showCard = function(meal) {
			if (!meal) return;
			if (meal.$id === vm.activeCard) {
				return true;
			}
			return false;
		};

		//Hide Card
		vm.hideCard = function(meal) {
			if (!meal) return;
			//Compare the current time and the current meal's created time to determine if we should be showing it to the user or not
			var time = moment.unix(meal.time);
			var current = vm.time.moment;
			//Get the diff between the current time and the previous time
			var diff = current.diff(time, 'hours'); //Check minutes for now
			//If the meal is four hours old or will be made in a day from the current time, we can display that to the end user
			//$log.log('diff', diff, meal.name);
			if (diff <= 4 && diff >= 0) {
				//$log.log('past', diff, meal.name);
				//Four Hours in the past
				//$log.log('hide');
				meal.hidden = false;
				//return false;
			} else if (diff <= 0 && diff >= -23) {
				//$log.log('future', diff, meal.name);
				//24 Hours into the future
				meal.hidden = false;
				//return false;
			} else {
				//$log.log('hide');
				meal.hidden = true;
			}
			//$log.log('hideCard', vm.time, meal.time);
			return meal.hidden;
		};

		//Show Time
		vm.showTime = function() {
			dishMapSelect.hide();
			if (!dishTimeSelect.timeActive) {
				dishCards.disable();
				dishTimeSelect.show();
			}
		};

		//Show Map
		vm.showMap = function() {
			dishTimeSelect.hide();
			if (!dishMapSelect.active) {
				dishCards.disable();
				dishMapSelect.show();
			}
		};

		//Current Location Handler
		vm.location = function() {
			return dishMapSelect.location;
		};

		vm.toggleModal = function() {
			$log.log('toggleModal', vm.currentUser, dishSignup.active);
			dishCards.enable();
			if (dishMapSelect.active) {
				dishMapSelect.hide(); //Hide the Map if it's open
				return;
			}
			if (dishTimeSelect.active) {
				dishTimeSelect.hide();
				return;
			}
			if (!vm.currentUser) {
				if (dishSignup.active) {
					dishSignup.hide();
				} else {
					dishSignup.show();
				}
				return;
			}
			if (vm.addingMeal) {
				vm.addingMeal = false;
			} else {
				vm.addingMeal = true;
			}
		};

		vm.viewMeal = function(meal) {
			$log.log('viewMeal');
			if (!meal) return;
			vm.activeCard = meal.$id;
			dishCards.setActiveCard(true);
		};

		vm.closeMeal = function() {
			vm.activeCard = null;
			dishCards.setActiveCard(false);
		};

		vm.text = function(meal) {
			$log.log('text');
			var content = 'Hi ' + meal.cook.username + ', I\'d like to order your ' + meal.name + ' on Dish.';
			$cordovaSms.send(meal.cook.phone, content)
				.then(function() {
					// Success! SMS was sent
				}, function(error) {
					// An error occurred
				});
		};

		vm.directions = function(meal) {
			var url = 'https://maps.google.com/?saddr=Startup%20Edmonton&daddr=' + encodeURI(meal.cook.address);
			SafariViewController.isAvailable(function(available) {
				if (available) {
					SafariViewController.show({
							'url': url
						},
						function(result) {
							$log.log("result", result);
						},
						function(error) {
							$log("error", result);
						});
				} else {
					// potentially powered by InAppBrowser because that (currently) clobbers window.open
					window.open(url, '_blank', 'location=yes');
				}
			})
		};

		vm.purchase = function(meal) {
			var content = 'Hi ' + meal.cook.username + ', I\'d like to order your ' + meal.name + ' on Dish.';
			vm.buyingMeal = true;
		};

		var mealStub = function(meal) {
			if (!meal) return;
			//Convert the time to something firebase can understand
			meal.cookId = '-Jy1AO0cBB_2xSbKX4Xy';
			meal.published = true;
			vm.meals.$add(meal);
		};

		window.mealStub = mealStub;
	}

	DishHomeController.$inject = ['$log', '$timeout', '$firebaseObject', '$firebaseArray', '$cordovaSms', 'FURL', 'User', 'dishTimer', 'dishCards', 'dishMapSelect', 'dishTimeSelect', 'dishSignup'];

	angular.module('dish.home')
		.controller('dishHomeController', DishHomeController);
})();