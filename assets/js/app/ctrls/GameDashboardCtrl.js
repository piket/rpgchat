RPGChat.controller('GameDashboardCtrl', ['$scope','$routeParams','Game','UserService','AlertService', function($scope,$routeParams,Game,UserService,AlertService){
    $scope.user = UserService.currentUser;
    $scope.game = Game.get({id:$routeParams.id}, function(data) {
        $scope.description = $scope.game.description;
        $scope.public = $scope.game.public;
        $scope.active = $scope.game.active;
        $scope.gm = $scope.user.id == $scope.game.gm.id;
    });

    // console.log('game',$scope.game);

    $scope.edit = {
        description: false,
        public: false,
        active: false
    }

    $scope.joined = function() {
        return _.find($scope.game.pending,{id:$scope.user.id});
    }

    $scope.playing = function() {
        if($scope.gm) return true;
        return _.find($scope.game.players,{id:$scope.user.id});
    }

    $scope.join = function() {
        $scope.game.pending = $scope.game.pending.concat([$scope.user]);
        Game.update({id:$scope.game.id},{pending:$scope.game.pending});
        AlertService.alert('green','You have joined '+$scope.game.name);
    }

    $scope.charName = function(arr,id) {
        for(var i = 0; i < arr.length; i++) {
            if(arr[i].player == id) {
                return arr[i].name;
            }
        }
        return "No character";
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

    $scope.accept = function(userIdx) {
        var newPlayer = $scope.game.pending.splice(userIdx,1)[0];
        $scope.game.players.push(newPlayer);
        Game.update({id:$scope.game.id},{pending:$scope.game.pending,players:$scope.game.players});
    }

    $scope.decline = function(userIdx) {
        $scope.game.pending.splice(userIdx, 1);
        Game.update({id:$scope.game.id},{pending:$scope.game.pending});
    }
}]);