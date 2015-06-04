RPGChat.controller('AccountCtrl', ['$scope','UserService', function($scope,UserService){
    console.log('Account ctrl loaded');
    UserService.info(function(err,data) {
        $scope.user = data;
        console.log('Account user:',$scope.user);
    });

    $scope.characterGame = function(charId) {
        return _.result(_.find($scope.user.playingGames, {id:charId}), 'name');
    }
}]);