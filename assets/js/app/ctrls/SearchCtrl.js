RPGChat.controller('SearchCtrl', ['$scope','$routeParams','Game','UserService', function($scope,$routeParams,Game,UserService){
    // console.log('Search loaded');
    var userId = UserService.currentUser.id;
    $scope.limit = $routeParams.limit || 25;
    $scope.page = $routeParams.p - 1 || 0;
    // console.log('params',$scope.limit,$scope.page)

    Game.query({limit:$scope.limit, p:$scope.page}, function(data) {
        $scope.games = data;
        // console.log('search results:',$scope.games);
    });


    $scope.search = function() {
        Game.query({q:$scope.searchTerm, limit:$scope.limit, p:$scope.page}, function(data) {
            $scope.games = data;
            // console.log('search results:',$scope.games);
        });
    }

    $scope.player = function(gm,arr) {
        if(gm == userId) return true;
        return _.find(arr, {id:userId});
    }
}]);