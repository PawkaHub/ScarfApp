(function() {
	'use strict';

	function DishTimeDirective($log, $q, $document, $window, $ionicGesture, dishTimer) {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: 'dishTimeController',
			controllerAs: 'vm',
			link: function($scope, elm, attrs) {
				var self = this;
				self = {};
				self.startY = 0;
				self.y = 0;
				$log.log('boom?');
				dishTimer.ready(function(currentTime) {
					$log.log('ready!', currentTime);

					//Get the header
					var headerEl = document.querySelector('.header');

					//Get the dragger
					var draggerEl = elm[0].querySelector('.time-dragger');
					var dragger = angular.element(draggerEl);
					var draggerHalf = 30; //Half the height of the dragger
					var draggerHeight = draggerHalf * 2;
					var bottomDistance = 0;

					//Get the window height for dragging the timer
					var windowHeight = $window.innerHeight;
					var halfHeight = windowHeight / 2;
					var timeSelections = 48; //Number of half hours user can select
					var topDrag = 116; //The space from the top of the window that we want to have the headers push away from
					var bottomDrag = 30;
					var dragRegion = windowHeight - (topDrag + bottomDrag) //Calculate the dragRegion we'll be using for actually computing hours
					var timeRegion = dragRegion - draggerHeight;
					var timeSection = timeRegion / timeSelections;
					var timePosition = 0;
					var normalizedTimePosition = 0;
					var region = 0;
					var prevRegion = 0;

					//Set the dragger's default position based on what time it is
					var hour = currentTime.hour;
					var defaultPosition = hour * timeSection;
					var future;
					var futureModifier;

					//$log.log('dragRegion', timeSection, dragRegion, defaultPosition);

					//Set default position
					dragger[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,' + (topDrag + 15) + 'px, 0)';

					var doTouch = function(e) {
						//$log.log('doTouch', e);
						dragger.addClass('active');
						headerEl.style[ionic.CSS.TRANSITION] = 'none';
						dragger[0].style[ionic.CSS.TRANSITION] = 'none';
					};

					var doDrag = function(e) {
						self.y = e.gesture.center.pageY;
						self.headerY = e.gesture.center.pageY - topDrag;
						//Handle the header by pushing it out of the way if we're near the bounds for it
						if (e.gesture.center.pageY <= topDrag) {
							//$log.log('Push up header!', self.y);
							headerEl.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + self.headerY + 'px, 0)';
						} else {
							headerEl.style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
						}

						if (e.gesture.center.pageY <= 0) {
							//Prevent us from going over the top or bottom of the window
							//$log.log('out of top bounds!');
							dragger[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0, 0, 0)';
						} else if (e.gesture.center.pageY >= (windowHeight - draggerHeight)) {
							bottomDistance = windowHeight - draggerHeight;
							//$log.log('out of bottom bounds!', bottomDistance);
							dragger[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + bottomDistance + 'px, 0)';
						} else {
							dragger[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + self.y + 'px, 0)';
							//Only increment the time if we're in the proper dragRegion
							timePosition = e.gesture.center.pageY - (topDrag - (bottomDrag * 2));
							if (timePosition <= (topDrag - 56)) {
								region = 0;
							} else if (timePosition >= dragRegion) {
								region = timeSelections;
							} else {
								//Normalize the timePosition for calculating our region values so that we only get values between 0 and 48
								normalizedTimePosition = self.y - topDrag;
								region = Math.round(normalizedTimePosition / timeSection);
								//$log.log('timePosition', timePosition, region);
							}
							//$log.log('finalRegion', region);
							//Only update the current time if we haven't already moved forward in time for this region (we can never go past our current date)
							if (prevRegion !== region) {
								//$log.log('update region', region);
								//Reset the future time to be the currentTime, and then re-apply the transformation (divided by two so it's in half hours, so that we always get an accurate time no matter how quickly the user moves their finger)
								futureModifier = region / 2
								future = moment(); //Get the current system time before updating the dishTimer's currentTime, as the currentTime will be overwriten for dishTimer once we make this change, and as such won't be reliable for the way we're implementing this code.
								future = future.add(futureModifier, 'h');
								dishTimer.useFuture(future);
							}
							prevRegion = region;
						}
					};

					var doRelease = function(e) {
						//$log.log('doRelease', e.gesture.center.pageY, topDrag);
						if (e.gesture.center.pageY <= topDrag) {
							//$log.log('header is currently offscreen');
							//Set the header and dragger to acceptable onscreen positions
							headerEl.style[ionic.CSS.TRANSITION] = '-webkit-transform 0.2s ease-in-out';
							headerEl.style[ionic.CSS.TRANSFORM] = 'translate3d(0,0,0)';
							dragger[0].style[ionic.CSS.TRANSITION] = '-webkit-transform 0.2s ease-in-out';
							dragger[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,' + (topDrag + 15) + 'px,0)';
							setTimeout(function() {
								headerEl.style[ionic.CSS.TRANSITION] = 'none';
								dragger[0].style[ionic.CSS.TRANSITION] = 'none';
							}, 200);
						}
						if (e.gesture.center.pageY >= windowHeight - draggerHalf) {
							//$log.log('dragger is currently over the bottom');
							bottomDistance = windowHeight - (draggerHeight + (bottomDrag + 15));
							//Set the dragger to acceptable onscreen positions
							dragger[0].style[ionic.CSS.TRANSITION] = '-webkit-transform 0.2s ease-in-out';
							dragger[0].style[ionic.CSS.TRANSFORM] = 'translate3d(0,' + bottomDistance + 'px,0)';
							setTimeout(function() {
								dragger[0].style[ionic.CSS.TRANSITION] = 'none';
							}, 200);
						}
						if (dragger.hasClass('active')) {
							dragger.removeClass('active');
						}
					};

					$ionicGesture.on('drag', function(e) {
						ionic.requestAnimationFrame(function() {
							doDrag(e);
						});
					}, dragger);

					$ionicGesture.on('touch', function(e) {
						ionic.requestAnimationFrame(function() {
							doTouch(e);
						});
					}, dragger);

					$ionicGesture.on('release', function(e) {
						ionic.requestAnimationFrame(function() {
							doRelease(e);
						});
					}, dragger);
				});
			},
			templateUrl: 'modules/dish-time/dish-time.html'
		};
	};

	DishTimeDirective.$inject = ['$log', '$q', '$document', '$window', '$ionicGesture', 'dishTimer'];

	angular.module('dish.time')
		.directive('dishTime', DishTimeDirective);
})();