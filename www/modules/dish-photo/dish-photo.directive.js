(function() {
	'use strict';

	function DishPhoto($log, $q, $cordovaCamera, dishSheet) {
		return {
			restrict: 'E',
			replace: true,
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			controller: ['$scope', function($scope) {
				var _self = $scope;
				var message = {};
				if (navigator.camera) {
					var imageOptions;
				}

				//$log.log('ngModel', $scope.ngModel);
				//If an ngModel exists, set the photo to that for now so we can see the already existing image
				if ($scope.ngModel && $scope.ngModel.currentPhoto) {
					_self.photo = $scope.ngModel.currentPhoto;
				}

				_self.convertDataURLToBlob = function(dataURL) {
					// convert base64/URLEncoded data component to raw binary data held in a string
					var byteString;
					if (dataURL.split(',')[0].indexOf('base64') >= 0)
						byteString = atob(dataURL.split(',')[1]);
					else
						byteString = unescape(dataURL.split(',')[1]);

					// separate out the mime component
					var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

					var extension = mimeString.split('/')[1];

					// write the bytes of the string to a typed array
					var ia = new Uint8Array(byteString.length);
					for (var i = 0; i < byteString.length; i++) {
						ia[i] = byteString.charCodeAt(i);
					}

					//$log.log('ia', ia);

					var blob = new Blob([ia], {
						type: mimeString
					});

					_self.convertblobToFile(blob, extension);
				};

				_self.convertblobToFile = function(theBlob, extension) {
					//A Blob() is almost a File() - it's just missing the two properties below which we will add
					theBlob.lastModifiedDate = new Date();
					theBlob.name = "." + extension;
					//If it's a pre-existing photo, update just that field instead of the entire model
					$log.log('check it', _self.ngModel);
					if (_self.ngModel && _self.ngModel.currentPhoto) {
						$log.log('write');
						_self.ngModel.currentPhoto = theBlob;
					} else if (_self.ngModel && _self.ngModel.currentPhoto === null) {
						$log.log('also write');
						_self.ngModel.currentPhoto = theBlob;
					} else {
						$log.log('bah');
						_self.ngModel = theBlob;
					}
					$log.log('file', _self.ngModel);
				};

				_self.openPicker = function() {
					$log.log('DishPhoto', $scope.ngModel, $scope.type);
					var options = {};
					options.buttons = [];
					options.buttons[0] = {
						text: 'Choose from Library'
					};
					options.buttons[1] = {
						text: 'Take Photo'
					};
					if (_self.photo && _self.ngModel) {
						$log.log('Show it');
						options.destructiveText = 'Remove Photo';
					}
					dishSheet.show(options).then(function(button) {
						if (button === 'destructive') {
							$log.log('Remove Photo');
							//Set the deleteRequested flag to be true to be handled by external deletion code depending on context
							if (_self.ngModel.currentPhoto) {
								_self.photo = null;
								_self.ngModel.deleteRequested = true;
							} else {
								//Handle if the photo hasn't been uploaded to the server yet, and just delete the photo from the model as normal
								_self.photo = null;
								_self.ngModel = null;
							}
							return;
						}
						if (button === 0) {
							$log.log('Take from library');
							imageOptions = {
								quality: 50,
								destinationType: Camera.DestinationType.DATA_URL,
								sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
								allowEdit: false,
								targetWidth: 800,
								targetHeight: 800,
								encodingType: Camera.EncodingType.JPEG,
								popoverOptions: CameraPopoverOptions,
								saveToPhotoAlbum: false,
								correctOrientation: true
							};
						}
						if (button === 1) {
							$log.log('Take photo');
							imageOptions = {
								quality: 50,
								destinationType: Camera.DestinationType.DATA_URL,
								sourceType: Camera.PictureSourceType.CAMERA,
								allowEdit: false,
								targetWidth: 800,
								targetHeight: 800,
								encodingType: Camera.EncodingType.JPEG,
								popoverOptions: CameraPopoverOptions,
								saveToPhotoAlbum: false,
								correctOrientation: true
							};
						}
						$cordovaCamera.getPicture(imageOptions).then(function(imageURI) {
							_self.photo = "data:image/jpeg;base64," + imageURI;
							_self.convertDataURLToBlob(_self.photo);
						}, function(err) {
							// error
							message.message = err;
							message.buttonText = 'Sure Thing.';
						});
					});
				};
			}],
			template: '<div class="photo" ng-click="openPicker()"><div class="uploaded-photo" style="background-image:url({{photo}});"></div></div>'
		};
	}

	DishPhoto.$inject = ['$log', '$q', '$cordovaCamera', 'dishSheet'];

	angular.module('dish.photo')
		.directive('dishPhoto', DishPhoto);
})();