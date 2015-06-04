angular.module('draggable',[]).directive('draggable', ['$document','$compile',function($document,$compile){
    return {
        scope: {
            yStart: '=?startingY',
            xStart: '=?startingX',
            gridY: '=?',
            gridX: '=?',
            offsetY: '=?',
            offsetX: '=?',
            limitY: '=?',
            limitX: '=?',
            destroyX: '=?',
            destroyY: '=?',
            dragParams: '=?',
            dragTemplate: '=?'
        },
        restrict: 'E',
        link: function($scope,$element){
            console.log($element)
            console.log($scope);
            var gridSizeY = $scope.gridY || 0;
            var gridSizeX = $scope.gridX || 0;
            var gridOffsetY = $scope.offsetY || 0;
            var gridOffsetX = $scope.offsetX || 0;
            var limitX = $scope.limitX || false;
            var limitY = $scope.limitY || false;
            var destroyX = $scope.destroyX || false;
            var destroyY = $scope.destroyY || false;
            var x = $scope.xStart || 0;
            var y = $scope.yStart || 0;
            var startX = 0, startY = 0;

            $scope.$watch('gridY', function(newVal) {
                gridSizeY = newVal;
            });
            $scope.$watch('gridX', function(newVal) {
                gridSizeX = newVal;
            });
            $scope.$watch('offsetY', function(newVal) {
                gridOffsetY = newVal;
            });
            $scope.$watch('offsetX', function(newVal) {
                gridOffsetX = newVal;
            });
            $scope.$watch('limitY', function(newVal) {
                limitY = newVal;
            });
            $scope.$watch('limitX', function(newVal) {
                limitX = newVal;
            });
            $scope.$watch('xStart', function(newVal) {
                x = newVal;
            });
            $scope.$watch('yStart', function(newVal) {
                y = newVal;
            });
            $scope.$watch('destroyX', function(newVal) {
                destroyX = newVal;
            });
            $scope.$watch('destroyY', function(newVal) {
                destroyY = newVal;
            });

            var loadParams = function(newObj) {
                gridSizeY = newObj.gridY || gridSizeY;
                gridSizeX = newObj.gridX || gridSizeX;
                gridOffsetY = newObj.offsetY || gridOffsetY;
                gridOffsetX = newObj.offsetX || gridOffsetX;
                limitX = newObj.limitX || limitX;
                limitY = newObj.limitY || limitY;
                destroyX = newObj.destroyX || destroyX;
                destroyY = newObj.destroyY || destroyY;
                x = newObj.startingX || x;
                y = newObj.startingY || y;

                if(newObj.template) {
                    $element.addAttr('drag-template',newObj.template);
                }
            }
            if($scope.dragParams) {
                loadParams($scope.dragParams);

                $scope.$watchCollection('dragParams', function(newObj) {
                    loadParams(newObj);
                });
            }

            $element.css({position: 'absolute', top: ($scope.yStart || 0)+'px', left: ($scope.xStart || 0)+'px'});

            $element.on('mousedown', function(event) {
                // Prevent default dragging of selected content
                // console.log(event.button)
                if(event.button === 0) {
                    event.preventDefault();
                    if($element.attr('drag-template')) {
                        newScope = $scope.$new();
                        // console.log('new scope:',newScope)
                        newElm = $compile($element.clone())($scope.$parent);

                        $element.removeAttr('drag-template');
                        $element.after(newElm);
                    }

                    startX = event.screenX - x;
                    startY = event.screenY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                    $element.addClass('drag-active');
                }
            });

            function mousemove(event) {
                x = event.screenX - startX;

                if(limitX) {
                    if(limitX.min && x < limitX.min) {
                        x = limitX.min;
                    } else if(limitX.max && x > limitX.max) {
                        x = limitX.max;
                    }
                }

                y = event.screenY - startY;

                if(limitY) {
                    if(limitY.min && y < limitY.min) {
                        y = limitY.min;
                    } else if(limitY.max && y > limitY.max) {
                        y = limitY.max;
                    }
                }

                $element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });

            }

            function mouseup() {
                var destroyElm = false;
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                // console.log($scope)

                if(gridSizeY > 0) {
                    y -= (y % gridSizeY) - gridOffsetY;
                } else {
                    y -= gridOffsetY;
                }

                if(gridSizeX > 0) {
                    x -= (x % gridSizeX) - gridOffsetX;
                } else {
                    x -= gridOffsetX;
                }

                if(limitX) {
                    if(limitX.min && x < limitX.min) {
                        x = limitX.min;
                    } else if(limitX.max && x > limitX.max) {
                        x = limitX.max;
                    }
                }

                if(limitY) {
                    if(limitY.min && y < limitY.min) {
                        y = limitY.min;
                    } else if(limitY.max && y > limitY.max) {
                        y = limitY.max;
                    }
                }

                if(destroyX && (x < destroyX.min || x > destroyX.max)) {
                    destroyElm = true;
                }

                if(destroyY && (y < destroyY.min || y > destroyY.max)) {
                    destroyElm = true;
                }
                console.log("y by x",y,x);

                if(destroyElm) {
                    console.log('destroyed');
                    $element.remove();
                    $scope.$destroy();
                } else {
                    $element.css({
                        top: y + 'px',
                        left:  x + 'px'
                    });

                    $element.removeClass('drag-active');
                }
            }
        }
    }
}]);