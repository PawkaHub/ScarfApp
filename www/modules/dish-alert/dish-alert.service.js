(function() {
	'use strict';

	function DishAlertService($window, $q, $ionicPopup, $timeout) {
		var _self = this;
		var alertActive = false;

		_self.show = function _showAlert(data) {
			var deferred = $q.defer();
			var alertPopup;

			if (alertActive) {
				return deferred.promise;
			}

			if (!data) {
				deferred.reject({
					error: 'No data included for alert.'
				});
			}

			alertActive = true;

			alertPopup = $ionicPopup.alert({
				title: '',
				template: data.message,
				buttons: [{
					text: data.buttonText
				}]
			});

			alertPopup.then(function(res) {
				alertActive = false;
				deferred.resolve(res);
			});

			return deferred.promise;
		};
	};

	DishAlertService.$inject = ['$window', '$q', '$ionicPopup', '$timeout'];

	angular.module('dish.alert')
		.service('dishAlert', DishAlertService);
})();