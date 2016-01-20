(function() {
	'use strict';

	function DishMapController($log, $scope, dishMapData, dishMapSelect, GOOGLE_MAPS_KEY) {
		var vm = this;
		$log.log('dishMapController');

		vm.mapActive = function() {
			return dishMapSelect.active;
		}

		vm.map = angular.extend($scope, {
			center: {
				lat: 53.5458841, //Startup Edmonton
				lng: -113.5012418,
				zoom: 17
			},
			defaults: {
				zoomControl: false,
				attributionControl: false
			},
			layers: {
				baselayers: {
					grayscale: {
						name: 'Grayscale',
						url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
						type: 'xyz',
						layerOptions: {
							apikey: 'pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ',
							mapid: 'mapbox.light'
						}
					}
				}
			},
			events: {
				map: {
					enable: ['dragend', 'zoomend'],
					logic: 'emit'
				}
			}
		});

		var googleKey = GOOGLE_MAPS_KEY;
		var geocoder = L.Control.Geocoder.google(googleKey);

		var getAddress = function() {
			vm.loading = true;
			dishMapData.getMap().then(function(map) {
				var center = map.getCenter();
				$log.log('dragend', map, center);
				geocoder.reverse(center, map.options.crs.scale(map.getZoom()), function(results) {
					var result = results[0];
					if (result) {
						$log.log('result', result);
						var string = result.name;
						var split = string.split(',');
						var combined;
						if (split[1]) {
							combined = split[0] + ', ' + split[1];
						} else {
							combined = split[0];
						}
						vm.location = combined;
						//Update the location in the service for app-wide propagation
						dishMapSelect.setLocation(combined);
					}
					vm.loading = false;
				});
			});
		}

		$scope.$on('dishMap.dragend', function(event, args) {
			getAddress();
		});
		$scope.$on('dishMap.zoomend', function(event, args) {
			getAddress();
		});
	};

	DishMapController.$inject = ['$log', '$scope', 'dishMapData', 'dishMapSelect', 'GOOGLE_MAPS_KEY'];

	angular.module('dish.map')
		.controller('dishMapController', DishMapController);
})();