RPGChat.controller('SearchCtrl', ['$scope','Game', function($scope,Game){
    console.log('Search loaded');

    $scope.games = Game.query();

    $scope.search = function() {
        Game.get({q:$scope.searchTerm, limit:$scope.limit, p:$scope.page}, function(data) {
            $scope.games = data;
        });
    }
}]);