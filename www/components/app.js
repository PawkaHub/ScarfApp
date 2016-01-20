//Libraries
var libraries = [
  'ionic',
  'ngStorage',
  'ngCordova',
  'firebase'
];

//Components
var components = [
  'dish.bootstrap',
  'dish.timer',
  'dish.user'
];

//Modules
var modules = [
  'dish.cards',
  'dish.alert',
  'dish.keyboard',
  'dish.drawer',
  'dish.sheet',
  'dish.photo',
  'dish.gallery',
  'dish.input',
  'dish.text',
  'dish.more',
  'dish.time',
  'dish.map'
];

//Views
var views = [
  'dish.home',
  'dish.signup'
];

//Contact the arrays
var app = [];
app = app.concat(libraries, components, modules, views);

angular.module('dish', app);

//Temporarily disable right click context menu
document.addEventListener('contextmenu', function(event) {
  event.preventDefault()
});