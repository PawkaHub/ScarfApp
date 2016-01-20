(function() {
	'use strict';

	function DishTimerService($log, $q) {
		var start;
		var time;
		var elapsed;
		var duration
		var callback;
		var timer = this;
		var prevHour;
		var prevMinute;
		var currentTime = null;
		var displayTime = {};
		var futureTime = null;
		var watchCallbacks = [];
		var readyCallbacks = [];
		var notifiedReady = false;

		var tick = function() {
			//Only fire the callback every time it passes the specified tick
			if (elapsed > duration) {
				start = now();
				elapsed = 0;
				if (futureTime) {
					currentTime = futureTime;
				} else {
					currentTime = moment(); //Get the currentTime instead
				}
				//console.log('tick', currentTime);
				callback.call(timer, currentTime);
			}
			elapsed = now() - start;
			ionic.requestAnimationFrame(tick);
		}

		var now = function() {
			return window.performance ? window.performance.now() : Date.now();
		};

		this.currentTime = function() {
			return currentTime;
		}

		this.useFuture = function(future) {
			futureTime = future;
		};

		this.ready = function(callback) {
			readyCallbacks.push(callback);
		};

		this.notifyReady = function(currentTime) {
			angular.forEach(readyCallbacks, function(callback) {
				callback(currentTime);
			});
		};

		this.init = function(callback, duration /* milliseconds */ , autostart) {
			//$log.log('internal init');
			timer.callback(callback);
			timer.duration(duration);
			timer.reset();
			if (autostart) timer.start();
		};

		this.start = function(reset /* true to restart */ ) {
			//$log.log('internal start');
			if (reset) timer.reset(true);
			if (!callback) return;
			start = now();
			ionic.requestAnimationFrame(tick);
		};

		this.reset = function(stop) {
			//$log.log('internal reset', stop);
			time = 0;
		};

		this.duration = function(ms) {
			//$log.log('internal duration');
			if (ms) duration = ms;
			return duration;
		};

		this.callback = function(fn) {
			//$log.log('internal callback');
			if (typeof fn === "function") callback = fn;
			return fn;
		};

		//Register watch handlers
		this.watch = function(callback) {
			watchCallbacks.push(callback);
		};

		//Notify watchers
		this.notifyWatchers = function(currentTime) {
			angular.forEach(watchCallbacks, function(callback) {
				callback(currentTime);
			});
		};

		//Start up the dishTimer service for the application heartbeat
		this.init(function(time) {
			//console.log('starting');
			var day = time.format('dddd');
			var hour = time.hours();
			var minute = time.minutes();
			var second = time.seconds();
			displayTime.second = second;
			displayTime.minute = minute;
			displayTime.hour = hour;
			displayTime.day = day;
			displayTime.moment = currentTime;
			//console.log('displayTime', displayTime, futureTime);
			/*if (prevMinute && prevMinute !== minute) {
				//$log.log('The minute has changed!', prevMinute, minute);
				displayTime.minute = minute;
			}
			if (prevHour && prevHour !== hour) {
				//$log.log('The hour has changed!', prevHour, hour);
				displayTime.hour = hour;
			}*/
			//$log.log('hour: ' + hour + ', minute: ' + minute + ', second: ' + second);
			prevHour = hour;
			prevMinute = minute;
			//Fire a ready event only once the ready listeners have been registered
			if (!notifiedReady && readyCallbacks.length) {
				timer.notifyReady(displayTime);
			}
			//$log.log('notifiedReady!', notifiedReady);
			//Fire a watch event to any listeners
			timer.notifyWatchers(displayTime);
			if (!notifiedReady && readyCallbacks.length) {
				notifiedReady = true;
			}
		}, 10, true);
	};

	DishTimerService.$inject = ['$log', '$q'];

	angular.module('dish.timer')
		.service('dishTimer', DishTimerService);
})();