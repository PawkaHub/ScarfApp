(function() {
	'use strict';

	function DishTextDirective($log, $window, $q, $ionicPopup) {
		var invalid;
		return {
			restrict: 'AE',
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			replace: true,
			link: function($scope, elm, attrs, ctrl) {
				//Get the last section of the model and use that as the input name
				$scope.inputName = attrs.ngModel.split('.').pop();
				$scope.placeholder = attrs.placeholder;
				$scope.id = attrs.id;
			},
			template: '<label class="item item-input dish-input dish-text"><textarea id="{{id}}" name="{{inputName}}" type="{{inputType}}" autocomplete="off" autocorrect="off" autocapitalize="off" required="true" pattern="{{pattern}}" ng-model="ngModel" ng-minlength="minLength" ng-maxlength="maxLength" placeholder="{{placeholder}}"></textarea><i class="input-icon error icon ion-ios-close assertive"></i><i class="input-icon success icon ion-ios-checkmark positive"></i></label>'
		};
	}

	DishTextDirective.$inject = ['$log', '$window', '$q', '$ionicPopup'];

	angular.module('dish.text')
		.directive('dishText', DishTextDirective);
})();