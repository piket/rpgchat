RPGChat.controller('GameDashboardCtrl', ['$scope','$routeParams','Game','UserService', function($scope,$routeParams,Game,UserService){
    $scope.user = UserService.currentUser;
    $scope.game = Game.get({id:$routeParams.id}, function(data) {
        $scope.description = $scope.game.description;
        $scope.public = $scope.game.public;
        $scope.active = $scope.game.active;
        $scope.gm = $scope.user.id == $scope.game.gm.id;
    });

    console.log('game',$scope.game);

    $scope.edit = {
        description: false,
        public: false,
        active: false
    }


    $scope.editor = function(field) {
        for(var key in $scope.edit) {
            $scope.edit[key] = key == field;
        }
    }

    $scope.submitEdit = function(field) {
        Game.update({id:$scope.game.id},{description:$scope.description,public:$scope.public,active:$scope.active}, function(data) {
            $scope.game = data;
        });
        $scope.editor();
    }
}]);