angular.module('dish.bootstrap')

.config(function($provide) {
	/*$provide.decorator('$firebaseArray', function($delegate, $timeout, $firebaseUtils) {
		var _added = $delegate.prototype.$$added;
		var _updated = $delegate.prototype.$$updated;
		var _process = $delegate.prototype.$$process;
		var _notify = $delegate.prototype.$$notify;
		var cachedValues = [];

		$delegate.prototype.$$added = function(snap) {
			var self = this;
			var added = _added.call(self, snap);
			cachedValues.push(angular.copy(added));
			return added;
		};

		//We're overriding this function in our decorator to get some smart diffing functionality only on the client side as firebase doesn't support it by default, but we can figure out what elements have changed and how to animate them by comparing against our local cachedValues and determining the difference accordingly, then running our custom animate function that will allow us to animate the changed value's contain however we want.
		$delegate.prototype.$$updated = function(snap) {
			//console.log('updated called', this, snap);
			var self = this;
			var snapKey = snap.key();
			var record = self.$getRecord(snapKey);
			var val = snap.val();
			//Find the cachedValue from our cachedValues list
			var cachedVal = _.findWhere(cachedValues, {
				$id: snapKey
			});
			//Compare the current val's values against the cachedVals to determine what values have changed
			var traverse = function(collection) {
				var result = [];
				_.filter(collection, function(value, key, obj) {
					console.log('value', value, key, cachedVal[key]);
					//Return if the new val matches the cachedVal, this will leave us with a new object that shows what values have changed
					if (_.isObject(value) || _.isArray(value)) {
						traverse(value);
					}
					//console.log('result', result);
					if (value !== cachedVal[key]) {
						console.log('different', value);
						result.push(key);
					} else {
						//If it's not a match, update the cachedVal key to reflect the new value in the cachedValues array
						cachedVal[key] = value;
					}
				});

				return result;
			};

			var diff;

			//TODO: Make this function way less ugly, and potentially look into a way to do it recursively so that we can clean it up
			var compare = function(s, t) {
				var result = []; //For returning the changed values/keys
				if (typeof s !== typeof t) {
					console.log("two objects not the same type");
					return;
				}
				if (typeof s !== "object") {
					console.log('arguments are not typeof === "object"');
					return;
				}
				for (var prop in s) {
					if (s.hasOwnProperty(prop)) {
						if (t.hasOwnProperty(prop)) {
							//Handle deep nested comparisons
							if (angular.isObject(s[prop]) || angular.isArray(s[prop])) {
								for (var nestedProp in s[prop]) {
									if (s[prop].hasOwnProperty(nestedProp)) {
										if (t[prop].hasOwnProperty(nestedProp)) {
											//console.log('nestedProp match', t[prop][nestedProp]);
											if (!angular.equals(s[prop][nestedProp], t[prop][nestedProp])) {
												//console.log('nested property does not match', t[prop][nestedProp]);
												//Check if nestedProp value is an object
												if (angular.isObject(s[prop][nestedProp])) {
													for (var deepProp in s[prop][nestedProp]) {
														if (s[prop][nestedProp].hasOwnProperty(deepProp)) {
															if (t[prop][nestedProp].hasOwnProperty(deepProp)) {
																if (!angular.equals(s[prop][nestedProp][deepProp], t[prop][nestedProp][deepProp])) {
																	console.log('deep property does not match', deepProp);
																	result.push(deepProp);
																	//Update the deep properties to the newest value
																	t[prop][nestedProp][deepProp] = s[prop][nestedProp][deepProp];
																}
															}
														}
													}
												}
											}
										}
									}
									//console.log('nestedProp', nestedProp);
								}
							} else if (!angular.equals(s[prop], t[prop])) {
								//Do a shallow comparison
								console.log("property " + prop + " does not match");
								result.push(prop);
								//Update the cached value
								console.log('details', s[prop], t[prop]);
								t[prop] = s[prop];
							}
						} else {
							console.log("second object does not have property " + prop);
						}
					}
				}
				// now verify that t doesn't have any properties
				// that are missing from s
				for (prop in t) {
					if (t.hasOwnProperty(prop)) {
						if (!s.hasOwnProperty(prop)) {
							console.log("first object does not have property " + prop);
						}
					}
				}
				return result;
			}

			diff = compare(val, cachedVal);

			console.log('diff', diff);

			var diff = _.omit(val, function(value, key, obj) {
				console.log('value', value, key, cachedVal[key]);
				//Return if the new val matches the cachedVal, this will leave us with a new object that shows what values have changed
				if (value === cachedVal[key]) {
					return true;
				} else {
					//If it's not a match, update the cachedVal key to reflect the new value in the cachedValues array
					cachedVal[key] = value;
				}
			});
			//The diff shows us what keys were changed from firebase, as well as what the latest value is.
			//console.log('updated diff', diff);

			//Call our custom animate function to smoothly animate in the changes instead of running the process as normal (this doesn't trigger a $$notify right now, but we can always add that later if we need to pretty easily)
			return self.$$animate(snap, diff);
		};

		//We use this function instead of the normal firebase flow so that we can smoothly animate changes in that come from firebase instead of having them suddenly change within the DOM
		$delegate.prototype.$$animate = function(snap, diff) {
			var self = this;
			console.log('animate', self, snap, diff);
			var changed = false;
			var rec = self.$getRecord($firebaseUtils.getKey(snap));
			if (angular.isObject(rec)) {
				//Set the diff immediately on the record, so that we can prepare for animating before we update the value
				rec.animating = diff;
				// apply changes to the record
				$timeout(function() {
					rec.animating = null;
					changed = $firebaseUtils.updateRec(rec, snap);
					$firebaseUtils.applyDefaults(rec, self.$$defaults);
				}, 500);
			}
			return changed;
		};

		return $delegate;
	});*/
})