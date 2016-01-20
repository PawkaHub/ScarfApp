(function() {
	'use strict';

	function DishGalleryService($log, $window, $q, $ionicSlideBoxDelegate) {
		var _self = this,
			deferred;

		_self.enableSlide = function _enableSlide(enabled) {
			console.log('name', enabled);
			$ionicSlideBoxDelegate.$getByHandle('dishGallery').enableSlide(enabled);
		};

		_self.slide = function _slide(index, speed) {
			deferred = $q.defer();
			//console.log('DishGalleryService slide');
			window.disableConstantFocus = true;
			$ionicSlideBoxDelegate.$getByHandle('dishGallery').slide(index, speed);
			$timeout(function() {
				window.disableConstantFocus = false;
				deferred.resolve();
			}, 400);

			return deferred.promise;
		};

		_self.update = function _update() {
			$log.log('update');
			$ionicSlideBoxDelegate.$getByHandle('dishGallery').update();
		};

		_self.currentIndex = function _currentIndex() {
			$ionicSlideBoxDelegate.$getByHandle('dishGallery').currentIndex();
		};
	}

	DishGalleryService.$inject = ['$log', '$window', '$q', '$ionicSlideBoxDelegate'];

	angular.module('dish.gallery')
		.service('dishGalleryService', DishGalleryService);
})();