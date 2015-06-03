RPGChat.filter('preserveLines', ['$sce',function($sce) {
    return function(input) {
        if(!input) return;
        return $sce.trustAsHtml(input.replace(/\n/g,'<br>'));
    }
}]);