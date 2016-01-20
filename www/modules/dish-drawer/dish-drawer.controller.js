(function() {
	'use strict';

	function DishDrawerController($log, $element, $attr, $ionicGesture, $document, dishCards) {
		var el = $element[0];
		//$log.log('el', el);
		var dragging = false;
		var open = false;
		var startX, lastX, offsetX, newX;
		var side;

		// How far to drag before triggering
		var thresholdX = 15;
		// How far from edge before triggering
		var edgeX = 40;

		//Formula used to calculate dragging
		var calcX;

		var LEFT = 0;
		var RIGHT = 1;

		var isTargetDrag = false;

		var width = $element[0].clientWidth;
		var lastWidth = 0;

		var enableAnimation = function() {
			$element.addClass('animate');
		};
		var disableAnimation = function() {
			$element.removeClass('animate');
		};

		// Check if this is on target or not
		var isTarget = function(el) {
			while (el) {
				if (el === $element[0]) {
					return true;
				}
				el = el.parentNode;
			}
		};

		var startDrag = function(e) {
			//dishCards.disable();
			disableAnimation();
			dragging = true;
			offsetX = lastX - startX;
			//$log.log('Starting drag',lastX,startX,offsetX);
			//$log.log('Offset:', offsetX);
		};

		var startTargetDrag = function(e) {
			//dishCards.disable();
			disableAnimation();

			dragging = true;
			isTargetDrag = true;
			//lastX = 0;
			offsetX = lastX - startX;
			console.log('startTargetDrag', lastX, startX);
			/*if (newX === 0) {
				$log.log('drawer is already open and we\'re dragging in that region');
				lastX = 0;
				startX = 0;
			}*/
			//$log.log('Starting target drag', offsetX, lastX, startX);
			//$log.log('Offset:', offsetX);
		};

		var doDrag = function(e) {
			if (e.defaultPrevented) {
				return;
			}

			if (!lastX) {
				startX = e.gesture.touches[0].pageX;
			}

			//If the drawer is open, set startX to the lastX value so that we don't get the drawer jumping if the user drags in the middle of the drawer instead of on the edge of the screen
			if (open) {
				startX = lastX;
			}

			lastX = e.gesture.touches[0].pageX;

			if (!dragging) {
				// Dragged 15 pixels and finger is by edge
				if (Math.abs(lastX - startX) > thresholdX) {
					if (isTarget(e.target)) {
						startTargetDrag(e);
					} else if (startX < edgeX) {
						startDrag(e);
					}
				}
			} else {
				if (open) {
					calcX = (0 + (lastX - offsetX));
					newX = Math.min(0, calcX);
					//$log.log('values', lastX, startX, offsetX);
				} else {
					calcX = (-width + (lastX - offsetX));
					newX = Math.min(0, calcX);
				}
				ionic.requestAnimationFrame(function() {
					el.style.transform = el.style.webkitTransform = 'translate3d(' + newX + 'px, 0, 0)';
				});

			}
			if (dragging) {
				e.gesture.srcEvent.preventDefault();
			}
		};

		var doEndDrag = function(e) {
			//$log.log('doEndDrag');
			startX = null;
			lastX = null;
			offsetX = null;
			isTargetDrag = false;

			if (!dragging) {
				return;
			}

			dragging = false;

			//$log.log('End drag');
			enableAnimation();

			//Don't re-enable the dishCards if a card is currently active
			/*var activeCard = dishCards.activeCard;
			if (!activeCard) {
				dishCards.enable();
			}*/

			ionic.requestAnimationFrame(function() {
				var calc;
				if (open) {
					calc = (newX < (-width / 4));
				} else {
					calc = (newX < (-width / 2));
				}
				//$log.log('calc', calc);
				if (calc) {
					//$log.log('close');
					open = false;
					el.style.transform = el.style.webkitTransform = 'translate3d(' + -width + 'px, 0, 0)';
				} else {
					open = true;
					//$log.log('open');
					el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0, 0)';
				}
			});
		};

		side = $attr.side == 'left' ? LEFT : RIGHT;
		//$log.log(side);

		//We listen to the touchStart events so that we can disable the dishCards and prevent any scrolling if the user wants to drag open the drawer.
		var touchStart = function(e) {
			//$log.log('drawer touchStart', e);
			//Check if we're in the drag region and disable the dishCards if we are
			startX = e.touches[0].pageX;

			if (!dragging) {
				// If the finger is by the edge by within 15 pixels
				if (startX < thresholdX) {
					$log.log('edge disable');
					//dishCards.disable();
				}
			}
		};

		document.body.addEventListener('touchstart', touchStart, false);

		$ionicGesture.on('drag', function(e) {
			doDrag(e);
		}, $document);
		$ionicGesture.on('dragend', function(e) {
			doEndDrag(e);
		}, $document);


		this.close = function() {
			open = false;
			//Don't re-enable the dishCards if a card is currently active
			/*var activeCard = dishCards.activeCard;
			if (!activeCard) {
				dishCards.enable();
			}*/
			enableAnimation();
			ionic.requestAnimationFrame(function() {
				if (side === LEFT) {
					el.style.transform = el.style.webkitTransform = 'translate3d(-100%, 0, 0)';
				} else {
					el.style.transform = el.style.webkitTransform = 'translate3d(100%, 0, 0)';
				}
			});
		};

		this.open = function() {
			open = true;
			//dishCards.disable();
			enableAnimation();
			ionic.requestAnimationFrame(function() {
				//$log.log('run open', el);
				if (side === LEFT) {
					el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
				} else {
					el.style.transform = el.style.webkitTransform = 'translate3d(0%, 0, 0)';
				}
			});
		};
	}

	DishDrawerController.$inject = ['$log', '$element', '$attrs', '$ionicGesture', '$document', 'dishCards'];

	angular.module('dish.drawer')
		.controller('dishDrawerController', DishDrawerController);
})();