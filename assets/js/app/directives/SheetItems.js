angular.module('sheetItem', []).directive('sheetItem', ['$compile','$sce', function($compile,$sce){
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: {
            edit: '=?',
            display: '=',
            name: '=',
            toggle: '=',
            // x: '=',
            // y: '='
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
                            html = '<div class="injected"><label ng-class="{active:values.'+$scope.name+'}">'+$scope.name+'</label><textarea name="'+$scope.name+'" class="" ng-model="values.'+$scope.name+'"></textarea></div>';
                            break;
                        case 'input-text':
                            html = '<div class="injected"><label ng-class="{active:values.'+$scope.name+'}">'+$scope.name+'</label><input type="text" name="'+$scope.name+'" ng-model="values.'+$scope.name+'"></div>';
                            break;
                    }
                    // html += '<div class="btn-div">' +
                        // '<a ng-click="charsheet.submitEdit('+$scope.name+')" class="btn-floating waves-effect waves-light purple sheet-edit-btn"><i class="mdi-action-done"></i></a>' +
                        // '<a ng-click="charsheet.clear('+$scope.name+')" class="btn-floating waves-effect waves-light purple sheet-edit-btn"><i class="mdi-content-clear"></i></a></div>';
                } else {
                    switch($scope.display) {
                        case 'p':
                            html = '<p class="injected" ng-bind-html="values.'+$scope.name+' | preserveLines"></p>';
                            break;
                        case 'b':
                            html = '<b class="injected" ng-bind-html="values.'+$scope.name+'"></b>';
                            break;
                    }
                    // html += '<div class="btn-div"><a ng-click="toggleEdit('+$scope.name+')" class="btn-floating waves-effect waves-light purple sheet-edit-btn"><i class="mdi-editor-mode-edit"></i></a></div>';
                }
                // console.log('toggle val',newVal,'sheet item html:',html)
                // console.log('vars:',$scope)
                $element.html(html);
                $compile($element.contents())($scope.$parent);
            });
        }
    };
}]);

//  style="postion:absolute;top:'+$scope.y+';left:'+$scope.x+'"