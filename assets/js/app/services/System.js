RPGChat.factory('System', ['$resource', function($resource){
    return $resource('/api/system/:id', null, {'update': {method: 'PUT'}});
}]);