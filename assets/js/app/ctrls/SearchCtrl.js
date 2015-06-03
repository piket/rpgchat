RPGChat.controller('SearchCtrl', ['$scope','$routeParams','Game', function($scope,$routeParams,Game){
    console.log('Search loaded');
    $scope.limit = $routeParams.limit || 25;
    $scope.page = $routeParams.p - 1 || 0;
    console.log('params',$scope.limit,$scope.page)

    Game.query({limit:$scope.limit, p:$scope.page}, function(data) {
        $scope.games = data;
        console.log('search results:',$scope.games);
    });


    $scope.search = function() {
        Game.query({q:$scope.searchTerm, limit:$scope.limit, p:$scope.page}, function(data) {
            $scope.games = data;
            console.log('search results:',$scope.games);
        });
    }
}]);