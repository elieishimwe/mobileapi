var apiROOT = 'http://console.ecin2edin.net/app_backend/v1/';
//var apiROOT = 'http://apps.donovancrewe.com/ecinwebui/app_backend/v1/';
//var apiROOT = 'http://localhost:8100#/ecin/app_backend/v1/';

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicModal) {
    $scope.openTC = function  () {
        console.log('Link Open');
        //window.open('http://localhost/ecin/terms.html', '_system');
        window.open('http://console.ecin2edin.net/terms.html', '_system');
        /* window.open('http://apps.donovancrewe.com/ecinwebui/terms.html', '_system');*/
    }

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    $scope.cat = {};
    $scope.Sub = {};
    $scope.subs = [];
    $scope.subsubs = [];
    $scope.report = {};
    $scope.img;
    $ionicModal.fromTemplateUrl('templates/login.html', function($ionicModal, Report) {
        $scope.loginModal = $ionicModal;
    }, {
        scope: $scope,
        animation: 'slide-in-up' //,
            // focusFirstInput: true
    });
    //Be sure to cleanup the modal by removing it from the DOM
    $scope.$on('$destroy', function() {
        $scope.loginModal.remove();
    });

    document.addEventListener("online", onOnline, false);

    function onOnline() {
        if (Report.savedReports.length > 0) {
            for (var i = Report.savedReports.length - 1; i >= 0; i--) {
                if (Report.savedReports[i].img) {

                    Report.postReportWithImage(Report.savedReports[i]);
                } else {

                    Report.postReport(Report.savedReports[i]);
                }
            };
        }
    }
})

.controller('LoginCtrl', function($scope, $http, $state, $ionicLoading, AuthenticationService, User) {
    $scope.message = "";
    $scope.toggleLog = false;
    $scope.card = false;
    $scope.cardReg = false;
    $scope.cardSuccess = false;
    $scope.normal = false;
    $scope.toggleButton = function(argument) {
        // body...
        $scope.toggleLog = !$scope.toggleLog;
        $scope.card = false;
        $scope.cardReg = false;
        $scope.cardSuccess = false;
    }
    $scope.toggleReset = function(argument) {
        // body...
        console.log($scope.toggleLog);
        console.log($scope.normal)
        $scope.normal = !$scope.normal;
        $scope.card = false;
        $scope.cardReg = false;
        $scope.cardSuccess = false;
        $scope.safeApply();
    }
    console.log(User.details);

    $scope.user = {
        cell: null,
        password: null

    };

    $scope.hide = function() {
        $scope.loginModal.hide();
        $state.go('app.home', {}, {
            reload: true,
            inherit: false
        });
    };
    $scope.login = function() {
        $ionicLoading.show({
            template: 'Loggin In...'
        });
        AuthenticationService.login($scope.user);
    };
    $scope.resetP = function() {
        if ($scope.user && $scope.user.cell && $scope.user.password) {
            AuthenticationService.reset($scope.user).then(function(argument) {
                $scope.toggleLog = false;
                $scope.normal = false;
            });
        }
    };
    $scope.register = function() {
        AuthenticationService.register($scope.user);
    };

    $scope.$on('event:auth-loginRequired', function(e, rejection) {
        $scope.loginModal.show();
    });

    $scope.$on('event:auth-loginConfirmed', function() {
        $ionicLoading.hide();
        $scope.username = null;
        $scope.password = null;
        $scope.card = false;
        $scope.cardReg = false;
        $scope.cardSuccess = false;
        $scope.loginModal.hide();
    });

    $scope.$on('event:auth-login-failed', function(e, status) {
        $ionicLoading.hide();
        var error = "Invalid Username or Password.";
        $scope.card = true;
        $scope.message = error;
    });
    $scope.$on('event:auth-register-complete', function(e, status) {
        $scope.toggleButton();
        $scope.cardReg = false;
        $scope.card = false;
        $scope.cardSuccess = true;
        $scope.message = status;
    });
    $scope.$on('event:auth-register-failed', function(e, status) {
        var error = status;
        $scope.cardReg = true;
        $scope.message = error;
    });

    $scope.$on('event:auth-logout-complete', function() {
        $state.go('app.home', {}, {
            reload: true,
            inherit: false
        });
    });
})

.controller('HomeCtrl', function($ionicViewService, $scope) {
    if (localStorage.getItem('watched')) {
        $scope.timer = true;
    } else {
        $scope.timer = false;
    }
    setTimeout(function(argument) {


        setTimeout(function(argument) {
            localStorage.setItem('watched', '1')
            $scope.timer = true;
            $scope.$apply();
        }, 17000);
    }, 3000)

    $ionicViewService.clearHistory();
})

.controller('ProjectCtrl', function($scope, $state, $http, $ionicLoading, Categories, User, Report, LocationService) {


    var ua = navigator.userAgent;
    if (ua.indexOf("Android") >= 0) {
        var androidversion = parseFloat(ua.slice(ua.indexOf("Android") + 8));
        if (androidversion != 4.4) {
            $scope.hideGal = false; // do whatever
        } else {
            $scope.hideGal = true;
        }
    }


    $scope.success   = false;
    $scope.alertBad  = false;
    $scope.alertGood = false;
    //$scope.img = '';
    $scope.report.gps_lat = LocationService.location.latitude;
    $scope.report.gps_lng = LocationService.location.longitude;
    $http.get(apiROOT + 'categories')
        .success(function(data) {
            var obj = data;
            if (obj.error) {
                $scope.$broadcast('event:categories-failed', obj.message);
            } else {
                $scope.$broadcast('event:categories-success', obj);
            }

        })
        .error(function(data, status, headers, config) {
            console.log("Error occurred.  Status:" + status);
        });

    $scope.clickUploadFile = function() {
        document.getElementById('FileInput').click();
    }

    $scope.$on('event:categories-success', function(e, res) {

        $scope.categories   = res.categories;
        $scope.cat.selected = $scope.categories[0];
        $scope.update();

    })
    $scope.show = function() {
        $ionicLoading.show({
            template: 'Sending...'
        });
    };

    $scope.hide = function() {
        $ionicLoading.hide();
    };

    $scope.update = function() {
        $scope.report.category = $scope.cat.selected.name;
        $scope.selectedCatSubs = $scope.cat.selected.subs;
        $scope.subs = $scope.selectedCatSubs;
        $scope.Sub.selected = $scope.selectedCatSubs[0];
        $scope.updateSub();
    }

    $scope.updateSub = function() {
        console.log($scope.Sub);
        $scope.report.sub_category = $scope.Sub.selected.name;
        $scope.selectedSubSubs = $scope.Sub.selected.subs;
        $scope.subsubs = $scope.selectedSubSubs;
    }

    $scope.takePhoto = function() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: 1, // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0 // 0=JPG 1=PNG
        }
        navigator.camera.getPicture(onSuccess, onFail, options);
    }

    $scope.pickPhoto = function() {
        // var options = {
        //     quality: 50,
        //     width: 640,
        //     height: 480,
        //     destinationType: Camera.DestinationType.FILE_URI,
        //     sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        //     encodingType: 0 // 0=JPG 1=PNG
        // }
        // navigator.camera.getPicture(onSuccess, onFail, options);
        var photo = document.getElementById('FileInput');
        photo.click();
        photo.onchange = function(argument) {
            if (photo.files && photo.files[0]) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    $scope.img = photo.files[0];
                    $scope.imgSrc = e.target.result;
                    $scope.showMessage = true;
                    $scope.$apply();
                };
                reader.readAsDataURL(photo.files[0]);
            }
            //console.log(photo.files);
        };


    }
    var onSuccess = function(FILE_URI) {

        $scope.img = FILE_URI;
        $scope.imgSrc = FILE_URI;
        $scope.showMessage = true;
        $scope.$apply();
    };
    var onFail = function(e) {
        console.log("On fail " + e);
    }

    $scope.postReport = function() {

        if (LocationService.location.latitude == null) {
            if (navigator.geolocation) {
                $scope.show();
                var options = {
                    timeout: 10000,
                    enableHighAccuracy: false,
                    maximumAge: 90000
                };
                navigator.geolocation.getCurrentPosition(showPosition, onError, options);
                //navigator.geolocation.getCurrentPosition(showPosition);

            } else {
                $scope.hide();
                navigator.notification.alert('Please make sure to "Allow" GPS communication. And try again', doNothing);

            }

            function onError(argument) {
                $scope.hide();
                navigator.notification.alert('We have encountered an error Please make sure to "Allow" GPS communication.', doNothing);
            }

            function doNothing(argument) {
                // body...
            }

            function showPosition(position) {
                $scope.report.gps_lat = position.coords.latitude;
                $scope.report.gps_lng = position.coords.longitude;
                $scope.postAReport();
            }

        } else {
            $scope.report.gps_lat = LocationService.location.latitude
            $scope.report.gps_lng = LocationService.location.longitude
            $scope.postAReport();
        }

    }
    $scope.postAReport = function(argument) {
        //console.log('IMAGE@@@@@@ - ', $scope.img);
        if ($scope.img) {
            $scope.show();
            if ($scope.img.size) {
                Report.postReportWithImage($scope.img, $scope.report);
            } else {
                Report.postReportWithImageCam($scope.img, $scope.report);
            }
        } else {
            $scope.show();
            Report.postReport($scope.report);
        }
    }
    $scope.$on('event:report-success', function(e, res) {
        $scope.hide();
        $scope.success = true;
        $scope.report = {};
        $scope.alertGood = true;
        $scope.message = "Your Report Was Posted Successfully";
    })
    $scope.$on('event:report-failed', function(e, res) {
        $scope.hide();
        $scope.success = true;
        $scope.alertBad = true;
        $scope.message = "There was an issue sending your report, We'll Send it later for you";
        Report.savedReports.push($scope.report);
        //console.log(Report.savedReports);
    })



    /////MAP STUFF
    var map, InfoWindow, marker;

    $scope.initialize = function() {

        infowindow = new google.maps.InfoWindow();
        var mapOptions = {
            center: new google.maps.LatLng(-28.800, 31.025),
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: 16
        };
        map = new google.maps.Map(document.getElementById("map"), mapOptions);

    }
    if ($state.params.map) {
        $scope.initialize();
    }

    function Locate() {
        var myLatLng;

        if (navigator.geolocation) {

            var options = {
                timeout: 10000,
                enableHighAccuracy: true,
                maximumAge: 90000
            };
            navigator.geolocation.getCurrentPosition(showPosition, onError, options);
        } else {

            navigator.notification.alert('Please make sure to "Allow" GPS communication. And try again', doNothing);
        }

        function showPosition(position) {

            LocationService.location.latitude = position.coords.latitude;
            LocationService.location.longitude = position.coords.longitude;
            myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                draggable: true
            });
            map.panTo(myLatLng);
            google.maps.event.addListener(marker, 'dragend', function(evt) {

                LocationService.location.latitude = evt.latLng.lat();
                LocationService.location.longitude = evt.latLng.lng();

            });
        }

        function onError(argument) {

            navigator.notification.alert('We were unable to find you, Please drag the marker to your position', doNothing);
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(-28.800, 31.025),
                map: map,
                draggable: true
            });
            map.panTo(myLatLng);
            map.setZoom(12);
        }

    }

    Locate();
})

.controller('MapCtrl', function($scope, $http, LocationService) {


})

.controller('NewProjectCtrl', function($scope, $http, $ionicModal) {
    $scope.reports = [];

    $http.get(apiROOT + 'myreport').success(
        function(data) {



            for (var i = data.reports.length - 1; i >= 0; i--) {
                if (data.reports[i].img_url != '') {
                    data.reports[i].img_url = apiROOT + data.reports[i].img_url;
                }

            };
            $scope.reports = data.reports;
            console.log(data.reports)
        }
    ).error(
        function(data) {
            alert('There was an error retrieving your reports.');
            //console.log('MY REPORTS Error', data);

        }
    );

    $ionicModal.fromTemplateUrl('templates/rep-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.repmodal = modal;
    });
    $scope.openrepModal = function(report) {
        $scope.selectedReport = report;
        $scope.repmodal.show();
    };
    $scope.closerepModal = function() {

        $scope.repmodal.hide();
         $scope.selectedReport = {};
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.repmodal.remove();
    });


})

.controller('LogoutCtrl', function($scope, AuthenticationService) {

    localStorage.removeItem("key");
    AuthenticationService.logout();
})
