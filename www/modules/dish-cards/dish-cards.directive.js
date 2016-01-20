(function() {
	'use strict';

	var CARD_WIDTH = window.innerWidth;
	var CARD_HEIGHT = window.innerHeight - 60;
	var CARD_POOL_SIZE = 3;
	var DEFAULT_X_MARGIN = 20;
	var DEFAULT_Y_MARGIN = 116;
	var DEFAULT_LEFT_GAP = 5;
	var DEFAULT_RIGHT_GAP = CARD_WIDTH * 0.05;

	CardRepeatDirective.$inject = ['$log', '$parse', '$$rAF', '$rootScope', 'dishCards'];

	function CardRepeatDirective($log, $parse, $$rAF, $rootScope, dishCards) {
		var invalid;
		var CARD_DISABLED = dishCards.disabled;
		return {
			restrict: 'A',
			replace: true,
			transclude: 'element',
			link: postLink
		};

		function postLink(scope, element, attr, ctrl, transclude) {
			var node = element[0];
			var repeatExpr = attr.cardRepeat;
			var match = repeatExpr.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
			if (!match) {
				throw new Error("card-repeat expected expression in form of '_item_ in " +
					"_collection_[ track by _id_]' but got '" + attr.cardRepeat + "'.");
			}
			var keyExpr = match[1];
			var listExpr = match[2];
			var listGetter = $parse(listExpr);
			var data = [];

			var cardsLeaving = [];
			var cardsEntering = [];
			var cardsShownMap = {};
			var isLayoutReady = false;

			//Card Motion Settings
			var context = new MotionContext();
			var solver = context.solver();
			//var lastCard = null;
			var cards = [];

			//Default Card Constraints
			var cardWidth;
			var cardRightPull;

			//Starting Card Constraints
			var startCardLeftEdge;
			var startCardLeftMotionConstraint;
			var startCardRightMotionConstraint;

			//Subsequent Card Constraints
			var cardLeftPull;
			var cardLeftPos;
			var cardLeftGap;

			var colors = ['yellow', 'red', 'green'];

			//$log.log('hi', listGetter, listExpr, keyExpr);

			//Watch the collection for new values
			scope.$watchCollection(listGetter, function(newValue) {
				//$log.log('cardChanges', newValue);
				data = newValue || (newValue = []);
				if (!angular.isArray(newValue)) {
					throw new Error("card-repeat expected an array for '" + listExpr + "', " +
						"but got a " + typeof value);
				}
				// Wait for this digest to end before refreshing everything.
				scope.$$postDigest(function() {
					//$log.log('opa data', data, cards);
					RefreshLayout();
				});
			});

			function RefreshLayout(force) {
				// Create the pool of items for reuse, setting the size to (estimatedItemsOnScreen) * 2,
				// plus the size of the renderBuffer.
				if (!isLayoutReady || force) {
					//$log.log('RefreshLayout');
					//var poolSize = Math.max(5, renderBuffer * 3);

					var poolSize = Math.max(CARD_POOL_SIZE);
					//$log.log('poolSize', poolSize);
					for (var i = 0; i < poolSize; i++) {
						var card = new RepeatCard(i);
						card.card.element().style.backgroundColor = colors[i];
						var manipulator = new Manipulator(card.card.x, node.parentNode, 'x');
						//$log.log('manipulator', manipulator, node.parentNode);
						context.addManipulator(manipulator);
						//$log.log('card', card);
						cards.push(card);
						attachObserver(card);
					}

					isLayoutReady = true;
				}
				forceRerender(true);
			}

			function attachObserver(current) {
				var currentCard = current.card;
				var $current = currentCard.element();
				//$log.log('attachObserver', $current);

				//Render the entire cards data when the
				var observer = new MutationObserver(function(mutations) {
					render();
				});

				observer.observe($current, {
					attributes: true,
					childList: false,
					characterData: false
				});
			}

			function forceRerender() {
				return render(true);
			}

			function render(forceRerender) {
				var card;
				var behindCard;
				var i;
				var currentScope;
				var edge;
				var index;
				var prevIndex;
				var dataIndex;
				var element;
				//$log.log('render', data, cards);
				//Track card positions and loop them if they're offscreen
				for (i = 0; i < cards.length; i++) {
					if (data.length <= CARD_POOL_SIZE) {
						//$log.log('Data is less than or equal to CARD_POOL_SIZE', data, cards);
					} else {
						//$log.log('Data is greater than CARD_POOL_SIZE', data, cards);
					}
					card = cards[i].card;
					currentScope = cards[i].scope;

					var reversedIndex = data.length - i - 1; //We reverse the index here so we can count from 0 as the top of the card stack
					currentScope.$index = reversedIndex;
					currentScope.$top = card.cardTop;
					currentScope.$middle = card.cardMiddle;
					currentScope.$bottom = card.cardBottom;
					currentScope.$looped = card.cardLooped;

					dataIndex = currentScope.$dataIndex;

					if (dataIndex === data.length - 1) {
						//$log.log('We\'ve reached the end of the data stack!', data[dataIndex]);
						currentScope.$last = true;
					} else {
						currentScope.$last = false;
					}

					//$log.log('render dataIndex', dataIndex);

					currentScope[keyExpr] = data[dataIndex];

					if (currentScope.$$disconnected) {
						ionic.Utils.reconnectScope(card.scope);
					}
				}
				/*for (i = 0; i < data.length; i++) {
					if (data.length <= CARD_POOL_SIZE) {
						//$log.log('Data is less than or equal to CARD_POOL_SIZE', data, cards);
					} else {
						//$log.log('Data is greater than CARD_POOL_SIZE', data, cards);
					}
					card = cards[i];
					currentScope = card.scope;
					currentScope[keyExpr] = data[1];
					currentScope.$last = (i === 0);
					//currentScope.$last = (i === (data.length - 1));
					currentScope.$odd = !(currentScope.$even = (i & 1) === 0);

					$log.log('currentScope', currentScope.meal);

					cardsEntering.push(card);

					if (currentScope.$$disconnected) {
						ionic.Utils.reconnectScope(card.scope);
					}
				}*/

				if (forceRerender) {
					//$log.log('forceRerender', cardsEntering, cardsEntering.length);
					var rootScopePhase = $rootScope.$$phase;
					while (cardsEntering.length) {
						card = cardsEntering.pop();
						if (!rootScopePhase) card.scope.$digest();
					}
				} else {
					//$log.log('render normal');
					digestEnteringItems();
				}
			}

			function digestEnteringItems() {
				var card;
				if (digestEnteringItems.running) return;
				digestEnteringItems.running = true;

				$$rAF(function process() {
					var rootScopePhase = $rootScope.$$phase;
					while (cardsEntering.length) {
						card = cardsEntering.pop();
						//$log.log('digest card', card.scope);
						if (!rootScopePhase) card.scope.$digest();
					}
					digestEnteringItems.running = false;
				});
			}

			function RepeatCard(i) {
				var self = this;
				self.scope = scope.$new();
				transclude(self.scope, function(clone) {
					self.element = clone;
					self.element.data('$$cardRepeatItem', self);
					// TODO destroy
					self.node = clone[0];

					self.card = new Box(self.node);
					var card = self.card;

					// Create the constraints for the cards
					card.x = new c.Variable({
						name: 'card-' + i + '-x'
					});
					card.right = new c.Variable({
						name: 'card-' + i + '-right'
					});
					card.edge = new c.Variable({
						name: 'card-' + i + '-right-edge'
					});
					card.y = DEFAULT_Y_MARGIN - (i * 40);
					card.bottom = CARD_HEIGHT - (i * 40);
					card.index = i;
					card.scope = self.scope; //Include a reference to the scope so we can make use of it in external functions

					//Include a reference to the solver
					card._solver = solver;

					//Constrain the width of the cards to be set to our default card width
					cardWidth = eq(card.right, c.plus(card.x, CARD_WIDTH), medium);
					solver.addConstraint(cardWidth);

					if (i === 2) {
						card.cardTop = true;
						card.cardMiddle = false;
						card.cardBottom = false;
						card.dataIndex = 0;
					}
					if (i === 1) {
						card.cardTop = false;
						card.cardMiddle = true;
						card.cardBottom = false;
						card.dataIndex = 1;
					}
					if (i === 0) {
						card.cardTop = false;
						card.cardMiddle = false;
						card.cardBottom = true;
						card.dataIndex = 2;
					}

					startCardLeftMotionConstraint = new MotionConstraint(card.x, '>=', 0);
					context.addMotionConstraint(startCardLeftMotionConstraint);
					context.addBox(card);

					//Append the card to the parent container
					ionic.Utils.disconnectScope(self.scope);
					node.parentNode.appendChild(self.node);
				});
			}
		}
	}

	angular.module('dish.cards')
		.directive('cardRepeat', CardRepeatDirective);
})();