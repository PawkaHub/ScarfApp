(function() {
	'use strict';

	function DishTimeController($log, $timeout, dishTimer, dishTimeSelect) {
		var vm = this;

		vm.timeActive = function() {
			return dishTimeSelect.active;
		}

		//Sync up with Dish's internal clock
		dishTimer.watch(function(time) {
			$timeout(function() {}); //Force a digest
			vm.time = time;
			vm.time.formatted = time.moment.format('dddd h:mma');
		});
	};

	DishTimeController.$inject = ['$log', '$timeout', 'dishTimer', 'dishTimeSelect'];

	angular.module('dish.time')
		.controller('dishTimeController', DishTimeController);
})();