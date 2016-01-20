(function() {
	'use strict';

	function DishSheet($log, $q, $ionicActionSheet) {
		var _self = this;
		var sheetActive = false;

		_self.show = function _show(options) {
			var deferred = $q.defer();
			var actionSheet;

			if (sheetActive) {
				return deferred.promise;
			}

			if (!options) {
				deferred.reject({
					error: 'No options included for action sheet.'
				});
			}

			sheetActive = true;

			actionSheet = $ionicActionSheet.show({
				buttons: options.buttons,
				destructiveText: options.destructiveText,
				cancelText: 'Cancel',
				cancel: function() {
					sheetActive = false;
				},
				buttonClicked: function(index) {
					sheetActive = false;
					actionSheet(); //Close the actionSheet
					deferred.resolve(index);
				},
				destructiveButtonClicked: function() {
					sheetActive = false;
					actionSheet(); //Close the actionSheet
					deferred.resolve('destructive');
				}

			})
			return deferred.promise;
		};
	};

	DishSheet.$inject = ['$log', '$q', '$ionicActionSheet'];

	angular.module('dish.sheet')
		.service('dishSheet', DishSheet);
})();