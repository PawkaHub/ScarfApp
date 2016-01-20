(function() {
	'use strict';

	function DishBootstrapController($scope, $ionicPlatform, $cordovaSplashscreen, $timeout, $log, User) {

		$ionicPlatform.ready(function() {
			$timeout(function() {
				if (User.signedIn() === false) {
					$log.log('User is not signed in');
				} else {
					console.log('User', User.user);
					$scope.currentUser = User.user;
				}
			});
		});
	}

	DishBootstrapController.$inject = ['$scope', '$ionicPlatform', '$cordovaSplashscreen', '$timeout', '$log', 'User'];

	angular.module('dish.bootstrap')
		.controller('dishBootstrapController', DishBootstrapController);
})();