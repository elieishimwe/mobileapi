// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


var app       = angular.module('starter', ['ionic', 'starter.services', 'starter.controllers']);
var apiRoot   = 'siyaleader.co.za:8080/ecin2edin/console/app_backend/port_backend/public';
//var apiRoot = 'http://localhost:8000/';
var xhReq   = new XMLHttpRequest();
xhReq.open("GET", "//" + apiRoot + "/api/csrf", false);
xhReq.send(null);


app.constant("CSRF_TOKEN", xhReq.responseText);

app.run(function($ionicPlatform, $http,CSRF_TOKEN) {
    //$http.defaults.headers.common['X-CSRF-TOKEN'] = CSRF_TOKEN;
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)




        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
    if (localStorage.getItem("key")) {

        var apiKey = localStorage.getItem("key");
        var user_email = localStorage.getItem("user_email");
        $http.defaults.headers.common.Authorization = apiKey.toString();
    }

});

app.config(function($stateProvider, $urlRouterProvider) {

    // $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|blob|cdvfile|content):|data:image\//);



    $stateProvider

        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl'
        })

      /*  .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/login.html",
            controller: 'LoginCtrl'
        })*/


        .state('app.home', {
            url: "/home",
            views: {
                'menuContent': {
                    controller: "HomeCtrl",
                    templateUrl: "templates/home.html"
                }
            }
        })
        .state('app.map', {
            url: "/projects/:map",
            views: {
                'menuContent': {
                    controller: "ProjectCtrl",
                    templateUrl: "templates/map.html"
                }
            }
        })

    .state('app.projects', {
        url: "/projects",
        views: {
            'menuContent': {
                controller: "ProjectCtrl",
                templateUrl: "templates/projects.html"
            }
        }
    })

    .state('app.editprojects', {
        url: "/projects/:id",
        views: {
            'menuContent': {
                controller: "EditProjectCtrl",
                templateUrl: "templates/editproject.html"
            }
        }
    })

    .state('app.newproject', {
        url: "/newproject",
        views: {
            'menuContent': {
                controller: "NewProjectCtrl",
                templateUrl: "templates/newproject.html"
            }
        }
    })

    .state('app.tc', {
        url: "/tc",
        views: {
            'menuContent': {
                controller: "HomeCtrl",
                templateUrl: "templates/tc.html"
            }
        }
    })

    .state('app.logout', {
        url: "/logout",
        views: {
            'menuContent': {
                controller: "LogoutCtrl"
            }
        }
    });
    $urlRouterProvider.otherwise("/app/home");
});
