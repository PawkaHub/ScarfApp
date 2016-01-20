(function() {
	'use strict';

	function DishInputDirective($log, $window, $q, $ionicPopup) {
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
				//$log.log('inputName', $scope.inputName);

				//Based on the input name, assign the proper field type accordingly if it's a password or email
				switch ($scope.inputName) {
					case 'email':
						$scope.inputType = 'email';
						$scope.minLength = 0;
						break;
					case 'password':
						$scope.inputType = 'password';
						$scope.minLength = 8;
						break;
					case 'phone':
						$scope.inputType = 'number';
						$scope.minLength = 9;
						$scope.pattern = '[0-9]*';
						break;
					case 'experience':
						$scope.inputType = 'number';
						$scope.minLength = 0;
						$scope.maxLength = 3;
						$scope.pattern = '[0-9]*';
						break;
					case 'description':
						$scope.inputType = 'textarea';
						$log.log('oh', $scope.inputType);
						$scope.minLength = 0;
						$scope.maxLength = 500;
						break;
					case 'paymentTerms':
						$scope.inputType = 'text';
						$scope.minLength = 0;
						$scope.maxLength = 35;
					default:
						$scope.inputType = 'text';
						$scope.minLength = 0;
				}
			},
			template: '<label class="item item-input dish-input"><input id="{{id}}" name="{{inputName}}" type="{{inputType}}" autocomplete="off" autocorrect="off" autocapitalize="off" required="true" pattern="{{pattern}}" ng-model="ngModel" ng-minlength="minLength" ng-maxlength="maxLength" placeholder="{{placeholder}}" ng-show="inputType !== \'textarea\'"><i class="input-icon error icon ion-ios-close assertive"></i><i class="input-icon success icon ion-ios-checkmark positive"></i></label>'
		};
	}

	DishInputDirective.$inject = ['$log', '$window', '$q', '$ionicPopup'];

	angular.module('dish.input')
		.directive('dishInput', DishInputDirective);
})();