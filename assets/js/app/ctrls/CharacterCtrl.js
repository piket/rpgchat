RPGChat.controller('CharacterCtrl', ['$scope','$routeParams','$sce','$compile','UserService','AlertService','Game','Character', function($scope,$routeParams,$sce,$compile,UserService,AlertService,Game,Character){
    $scope.character = false;
    $scope.color = 'default';
    var character = null;
    var user = UserService.currentUser;

    Game.get({id:$routeParams.id}, function(data) {
        $scope.game = data;
        $scope.sheet = data.sheetTemplate;
        for(var i = 0; i < $scope.game.characters.length; i++) {
            if($scope.game.characters[i].player === user.id) {
                character = $scope.game.characters[i];
                console.log('character loaded');
                $scope.name = character.name;
                $scope.values = character.values;
                $scope.color = character.color;
                $scope.langauges = character.langauges;
                break;
            }
        }
        if(!character) {
            $scope.values = {};
            $scope.name = '';
            $scope.color = $scope.color;
            $scope.langauges = [];
        }
        console.log($scope.sheet)
        $scope.edit = {};
        $scope.sheet.forms.forEach(function(elm) {
            // console.log('elm',elm)
            $scope.edit[elm[2].name] = false;
        });
        // console.log('edit',$scope.edit)
        $('.injected').each(function() {
            $compile($(this).html())($scope);
        });
    });

    // $scope.genForm = function(elm) {
    //     switch(elm.form) {
    //         case 'textarea':
    //             return ;
    //     }
    // }

    // $scope.genHtml = function(elm) {
    //     switch(elm.html) {
    //         case 'p':
    //             return
    //     }
    // }

    $scope.toggleEdit = function(field) {
        $scope.temp = $scope.values[field];
        for(var key in $scope.edit) {
            $scope.edit[key] = key === field;
        }
        // console.log('field',field,$scope.edit);
    }

    $scope.editOff = function() {
        for(var key in $scope.edit) {
            $scope.edit[key] = false;
        }
    }

    $scope.submitEdit = function(field) {
        $scope.editOff();
        console.log('values',$scope.values);
    }

    $scope.clear = function(field) {
        console.log('values',$scope.values)
        $scope.values[field] = $scope.temp;
        $scope.editOff();
    }

    // var objectify = function(arr) {
    //     var obj = {};
    //     arr.forEach(function(item) {
    //         obj[item.name] = item.value;
    //     });
    //     return JSON.stringify(obj);
    // }

    $scope.save = function() {
        console.log('saving...',character);
        // formObj = objectify($('#sheet-form').serializeArray());
        // console.log('form',formObj);

        if(!character) {
            character = new Character();

            character.name = $scope.name;
            character.color = $scope.color;
            character.values = $scope.values;
            character.langauges = $scope.langauges;
            character.sheetTemplate = $scope.sheet.id;
            character.player = user.id;
            character.game = $scope.game.id;

            console.log('character',character)

            character.$save(function(data) {
                console.log('character saved',data);
                AlertService.alert('blue','Character '+$scope.name+' saved.');
            });
        } else {
            Character.update({id:character.id},{name:$scope.name,color:$scope.color,values:JSON.stringify($scope.values),langauges:$scope.langauges}, function(data) {
                console.log('character saved',data);
                AlertService.alert('blue','Character '+$scope.name+' saved.');
            });
        }
    }
}]);
