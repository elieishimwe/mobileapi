var apiROOT = 'http://www.siyaleader.co.za:8080/ecin2edin/console/app_backend/port_backend/public/'
//var apiROOT = 'http://apps.donovancrewe.com/ecinwebui/app_backend/v1/';
//var apiROOT = 'http://localhost:8000/';


var APIKEY;
angular.module('starter.services', ['http-auth-interceptor'])
    .directive('fileModel', ['$parse',
        function($parse) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function() {
                        scope.$apply(function() {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }
    ])

.factory('AuthenticationService', function($q, $rootScope, $http, authService, User) {
    var service = {
        login: function(user) {
            console.log('user', user);
            $http.post(apiROOT + 'api/v1/login', {
                    cell: user.cell,
                    password: user.password
                }, {
                    ignoreAuthModule: true
                })
                .success(function(data, status, headers, config) {
                    //var str = data.slice(1);
                    var obj = data;
                    if (obj.error) {
                        $rootScope.$broadcast('event:auth-login-failed', status);
                    } else {
                        APIKEY = obj.apiKey;
                        $http.defaults.headers.common.api_key = APIKEY; // Step 1
                        User.setDetails(obj);
                        localStorage.setItem("Cell1", obj.cell_no);
                        // Need to inform the http-auth-interceptor that
                        // the user has logged in successfully.  To do this, we pass in a function that
                        // will configure the request headers with the authorization token so
                        // previously failed requests(aka with status == 401) will be resent with the
                        // authorization token placed in the header
                        authService.loginConfirmed(data, function(config) {
                            // Step 2 & 3

                            localStorage.setItem("key", APIKEY);
                            config.headers.api_key = APIKEY;

                            console.log(config);
                            return config;

                        });
                    }
                })
                .error(function(data, status, headers, config) {
                    $rootScope.$broadcast('event:auth-login-failed', status);
                });
        },
        logout: function(user) {

            $http.post(apiROOT + 'api/v1/logout', {}, {
                    ignoreAuthModule: true
                })
                .finally(function(data) {
                    delete $http.defaults.headers.common.api_key;
                    $rootScope.$broadcast('event:auth-logout-complete');
                });
        },
        reset: function(user) {
            return $http.post(apiROOT + 'api/v1/forgot', user, {
                ignoreAuthModule: true
            }).then(function(argument) {
                return argument;
            }, function(argument) {
                $q.reject("We are having trouble resetting your password");
            });
        },
        loginCancelled: function() {
            authService.loginCancelled();
        },
        register: function(user) {

            $http.post(apiROOT + 'api/v1/register', {
                    cell: user.cell,
                    password: user.password,
                    name: user.name,
                    email: user.email,
                    ID: user.ID,
                    firstName:user.firstName
                }, {
                    ignoreAuthModule: true
                })
                .success(function(data, status, headers, config) {
                    //var str = data.slice(1);
                    var obj = data;
                    if (obj.error) {
                        $rootScope.$broadcast('event:auth-register-failed', obj.message);
                    } else {
                        $rootScope.$broadcast('event:auth-register-complete', obj.message);
                    }
                })
                .error(function(data, status, headers, config) {
                    $rootScope.$broadcast('event:auth-register-failed', status);
                });


        }
    };
    console.log(service);
    return service;
})

.factory('User', function() {
        var user = {
            details: {
                id: null,
                name: null,
                cell: null,
                apiKey: null
            },
            setDetails: function(user) {
                this.details = user;
            }
        };
        return user;
    })
    .factory('Categories', function($rootScope, $http) {
        var categories = {
            getCategories: function() {
                var cat = {};
                $http.get(apiROOT + 'categories')
                    .success(function(data, status, headers, config) {
                        var str = data.slice(1);
                        var obj = JSON.parse(str);
                        if (obj.error) {
                            $rootScope.$broadcast('event:categories-failed', obj.message);
                        } else {
                            $rootScope.$broadcast('event:categories-success', obj.message);
                        }

                    })
                    .error(function(data, status, headers, config) {
                        console.log("Error occurred.  Status:" + status);
                    });

            }
        };
        return categories;
    })


.factory('Report', function($rootScope, $http, User) {
        var reports = {
            postReport: function(report) {
                report.Cell1 = localStorage.getItem("user_email");
                $http.post(apiROOT + 'api/v1/report', report)
                    .success(function(data, status, headers, config) {

                        var obj = data;
                        if (obj.error) {
                            $rootScope.$broadcast('event:report-failed', obj.message);
                        } else {
                            $rootScope.$broadcast('event:report-success', obj.message);
                        }

                    })
                    .error(function(data, status, headers, config) {
                        $rootScope.$broadcast('event:report-failed', data);
                    });

            },
            postReportWithImage: function(img, data) {
                data.Cell1 = localStorage.getItem("user_email");
                var fd = new FormData();
                for (var k in data) {
                    if (data.hasOwnProperty(k)) {
                        fd.append(k.toString(), data[k]);
                    }
                }
                fd.append('img', img);



                $http.post(apiROOT + 'api/v1/report', fd, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        }
                    })
                    .success(function(data, status, headers, config) {
                        var obj = data;
                        if (obj.error) {
                            $rootScope.$broadcast('event:report-failed', obj.message);
                        } else {
                            $rootScope.$broadcast('event:report-success', obj.message);
                        }


                    })
                    .error(function(data, status, headers, config) {
                        $rootScope.$broadcast('event:report-failed', data);
                    });

            },
            postReportWithImageCam: function(img, data) {
                if (localStorage.getItem("key")) {
                    APIKEY = localStorage.getItem("key");

                }


                var myImg = img;
                var options = new FileUploadOptions();
                options.fileKey = "img";
                options.chunkedMode = false;
                var headers = {
                    'api_key': APIKEY
                };
                options.headers = headers;
                var params = data;
                options.params = params;
                var ft = new FileTransfer();
                ft.upload(myImg, encodeURI(apiROOT + 'api/v1/report'), onUploadSuccess, onUploadFail, options);

                function onUploadSuccess(argument) {
                    var obj = argument.response;
                    if (obj.error) {
                        $rootScope.$broadcast('event:report-failed', obj.message);
                    } else {
                        $rootScope.$broadcast('event:report-success', obj.message);
                    }
                    console.log(data);
                    // body...
                }

                function DN() {

                }

                function onUploadFail(argument) {
                    navigator.notification.alert('There Was An Error Uploading Your Image, We\'ll Try Again Later');
                    $rootScope.$broadcast('event:report-failed', argument.response);
                    // body...
                }

            },
            savedReports: []
        }
        return reports;
    })
    .factory('LocationService', function() {

        var Loc = {
            location: {
                latitude: null,
                longitude: null
            }
        };
        return Loc;

    })
