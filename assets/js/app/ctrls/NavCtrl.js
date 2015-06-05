RPGChat.controller('NavCtrl', ['$scope','$location','UserService','AlertService', function($scope,$location,UserService,AlertService){
    $scope.UserService = UserService;

    $scope.$watchCollection('UserService',function() {
        $scope.currentUser = UserService.currentUser;
        // console.log('user:',$scope.currentUser)
    });

    $scope.$on("$routeChangeSuccess", function () {
        $scope.path = $location.path();
    });

    $scope.logout = function() {
        UserService.logout(function(err,data) {
            AlertService.add('blue','You have been logged out.');
            $location.path('/');
        });
    }

    $scope.openAbout = function() {
        $('#aboutmodal').openModal();
    }
}]);