angular.module('sheetItem', []).directive('sheetItem', ['$compile','$sce', function($compile,$sce){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            edit: '=',
            display: '=',
            name: '=',
            toggle: '='
        }, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, $element) {
            var html = '';
            $scope.$watch('toggle', function(newVal) {
                if(newVal) {
                    switch($scope.edit) {
                        case 'textarea':
                            html = '<div class="input-field injected"><textarea name="'+$scope.name+'" class="materialize-textarea" ng-model="values.'+$scope.name+'"></textarea><label ng-class="{active:values.'+$scope.name+'}">'+$scope.name+'</label></div>';
                            break;
                    }
                } else {
                    switch($scope.display) {
                        case 'p':
                            html = '<p class="injected" ng-bind-html="values.'+$scope.name+' | preserveLines"></p>';
                    }
                }
                // console.log('toggle val',newVal,'sheet item html:',html)
                // console.log('vars:',$scope)
                $element.html(html);
                $compile($element.contents())($scope.$parent);
            });
        }
    };
}]);