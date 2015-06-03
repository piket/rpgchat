RPGChat.factory('Character', ['$resource', function($resource){
    return $resource('/api/character/:id', null, {'update': {method: 'PUT'}, 'create': {method: 'POST'}});
}]);