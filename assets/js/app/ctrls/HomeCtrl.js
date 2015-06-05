RPGChat.controller('HomeCtrl', ['$scope','$location','UserService','AlertService', function($scope,$location,UserService,AlertService) {
    console.log('Home loaded');

    $scope.showLogin = false;
    $scope.showSignup = false;
    $scope.invalid = {
        login: false,
        name: false,
        email: false,
        password: false,
        confirm: false
    };

    $scope.resetForms = function() {
        $scope.invalid = {
            login: false,
            name: false,
            email: false,
            password: false,
            confirm: false
        };
        $scope.username = '';
        $scope.password = '';
        $scope.email = '';
        $scope.confirm = '';
    }

    $scope.toggleLogin = function() {
        $scope.showLogin = !$scope.showLogin;
        $scope.showSignup = false;
        $scope.resetForms();
    }

    $scope.toggleSignup = function() {
        $scope.showLogin = false;
        $scope.showSignup = !$scope.showSignup;
        $scope.resetForms();
    }

    $scope.login = function() {
        UserService.login($scope.username,$scope.password,function(err,data) {
            $scope.password = '';
            if(err) {
                // alert(err);
                $scope.invalid.login = true;
                AlertService.alert('red','Invalid username or password');
            } else if (data && data.result) {
                AlertService.alert('green','You have been logged in!');
                $location.path('/account');
            } else {
                // alert('WARNING:',data.error);
                $scope.invalid.login = true;
                AlertService.alert('red','Invalid username or password');
            }
        });
    }

    $scope.signup = function() {
        UserService.signup($scope.username,$scope.email,$scope.password,$scope.confirm,function(err,data) {
            $scope.password = '';
            $scope.confirm = '';
            if(err) {
                console.log('Error:',err);
                if(typeof err != 'string') {
                    err.forEach(function(key) {
                        $scope.invalid[key] = true;
                        console.log(key)
                    });
                }
                AlertService.alert('red','Invalid entries, please try again.');
            } else {
                AlertService.add('green','You have successfully signed up!');
                $location.path('/account');
            }
        });
    }
}]);