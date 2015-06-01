RPGChat.controller('AccountCtrl', ['$scope','UserService', function($scope,UserService){
    console.log('Account ctrl loaded');
    UserService.info(function(err,data) {
        $scope.user = data;
        console.log('Account user:',$scope.user);
    });
}]);