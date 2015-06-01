RPGChat.factory('Game', ['$resource', function($resource){
    return $resource('/api/game/:id', null, {'update': {method: 'PUT'}});
}]);