RPGChat.factory('Sheet', ['$resource','AlertService', function($resource,AlertService){
    return $resource('/api/sheet/:id', null, {
            'update': {
                method: 'PUT'
            },
            'create': {
                method: 'POST',
                interceptor : {responseError : function(error) {
                    AlertService.alert('red','A sheet with that name already exists. Please rename your sheet.');
                }
            }
        }
    });
}]);