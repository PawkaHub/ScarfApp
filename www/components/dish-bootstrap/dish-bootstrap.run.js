angular.module('dish.bootstrap')

.run(function($ionicPlatform, $cordovaSplashscreen) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			window.cordova.plugins.Keyboard.disableScroll(true);
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			StatusBar.styleLightContent();
		}
		//Override window.open
		if (window.cordova && window.cordova.InAppBrowser) {
			window.open = cordova.InAppBrowser.open;
		}
		if (navigator.splashscreen) {
			$cordovaSplashscreen.hide();
		}
	});
});