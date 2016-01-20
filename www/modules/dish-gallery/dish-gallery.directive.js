(function() {
	'use strict';

	function DishGalleryDirective($log, $window, $q, $timeout, $ionicSlideBoxDelegate, dishGalleryService) {
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				ngModel: '=',
				onSlideChanged: '&'
			},
			link: function($scope, elm, attrs, ctrl) {
				//$log.log('link', $scope.ngModel);
				//Populate the intitial gallery when the data is loaded in from firebase
				$scope.$watchCollection('ngModel', function(nv, ov) {
					if (!$scope.slides.length) {
						angular.forEach(nv, function(slide) {
							$scope.slides.push(slide);
						});
					}
				});

				//$log.log('slides', $scope.slides);

				$scope.pager = attrs.pager;
			},
			controller: ['$scope', function($scope) {
				$scope.slides = [];

				$scope.slide = function(index) {
					dishGalleryService.slide(index);
				};

				//We need this so that we can force the slider to update it's dimensions whenever it's loaded, as it won't display otherwise
				$scope.updateSlider = function() {
					dishGalleryService.update();
				}

				$scope.preview = function _preview(slide) {
					//$log.log('preview!', slide);
					$scope.previewImage = slide;
				};
			}],
			template: '<ion-slide-box class="dish-gallery" show-pager="{{pager}}" delegate-handle="dishGallery" active-slide="0"><ion-slide class="dish-gallery-slide" ng-repeat="slide in slides" style="background-image:url({{slide}});" ng-init="updateSlider()"></ion-slide></ion-slide-box>'
		};
	}

	DishGalleryDirective.$inject = ['$log', '$window', '$q', '$timeout', '$ionicSlideBoxDelegate', 'dishGalleryService'];

	angular.module('dish.gallery')
		.directive('dishGallery', DishGalleryDirective);
})();