RPGChat.factory('Sheet', ['$resource', function($resource){
    return $resource('/api/sheet/:id', null, {'update': {method: 'PUT'}, 'create': {method: 'POST'}});
}]);