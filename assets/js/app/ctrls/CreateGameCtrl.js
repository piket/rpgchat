RPGChat.controller('CreateGameCtrl', ['$scope','$location','AlertService','UserService','Game','Sheet','System', function($scope,$location,AlertService,UserService,Game,Sheet,System) {
    var publicDesc = "Public games can be searched for and anyone can request to join. GMs still must approve all requests.";
    var privateDesc = "Private games cannot be searched for, GMs must send invites to players who are automatically approved if they respond yes."
    var template = null;
    var renameInput = $('#rename-input');

    $scope.sortNames = function(item) {
        console.log(item.name);
        if(item.name == 'other') return "zzzzzzzzzzzzzzz";
        return item.name.toLowerCase();
    }

    $scope.sheets = Sheet.query();
    $scope.systems = System.query();

    $scope.system = "none";
    $scope.sheet = "none";
    $scope.public = true;
    $scope.publicText = publicDesc;

    $scope.invalid = {
        name: false,
        system: false,
        sheet: false
    }

    $scope.custom = {
        name: '',
        system: 'any'
    }

    $scope.label = {
        name: ''
    }

    $('#confirm-modal').leanModal({
        dismissible: false
    });

    $('#rename').leanModal({
        dismissible: false
    });

    $scope.$watch('public', function(val) {
        $scope.publicText = val ? publicDesc : privateDesc;
        $('#publicdesc').tooltip({delay:50});
    });

    $scope.$watch('system', function(val) {
        console.log('system changed',val);
        if(val == '556a08b5713cc6cf4056bde5' || val == '55709a9728587811002fabec') {
            val = 'none';
        }
        Sheet.query({systemId:val}, function(data) {
            $scope.sheets = data;
            $scope.sheets.push({id:'custom',name:'Custom'});
        });
    });

    $scope.$watch('sheet', function(val) {
        if(val == 'custom') {
            $('#customsheet').openModal();
        }
    });

    $scope.create = function() {
        $scope.invalid = {
            name: false,
            system: false,
            sheet: false,
            description: false
        }

        var err = [];

        if(!$scope.name || $scope.name == '') err.push('name');
        if($scope.system == 'none') err.push('system');
        if($scope.sheet == 'none') err.push('sheet');
        if(!$scope.description || $scope.description == '') $scope.invalid.description = true;

        if(err.length > 0) {
            err.forEach(function(key) {
                $scope.invalid[key] = true;
            });
        } else if($scope.invalid.description) {
            $('#confirm-modal').openModal();
        } else {
            var game = new Game();

            game.name = $scope.name;
            game.system = $scope.system;
            game.description = $scope.description;
            game.public = $scope.public;
            game.gm = UserService.currentUser.id;
            game.sheetTemplate = $scope.sheet;
            game.$save(function(data) {
                console.log(data);
                AlertService.add('purple','You have created the game '+$scope.name);
                $location.path('/game/'+data.id+'/dashboard');
            });
        }
    }

    $scope.yes = function() {
        $('#confirm-modal').closeModal();
        var game = new Game();

        game.name = $scope.name;
        game.system = $scope.system;
        game.public = $scope.public;
        game.gm = UserService.currentUser.id;
        game.sheetTemplate = $scope.sheet;
        game.$save(function(data) {
            console.log(data);
            AlertService.add('purple','You have created the game '+$scope.name);
            $location.path('/game/'+data.id+'/dashboard');
        });
    }

    $scope.no = function() {
        $('#confirm-modal').closeModal();
    }

    $scope.cancel = function() {
        // var items = [];
        // angular.element('draggable').each(function(i,e) {
        //     var elm = angular.element(e);
        //     var x = parseInt(elm.css('top'));
        //     var y = parseInt(elm.css('left'));
        //     console.log(x,y);
        //     if(x <= 745 && x >= 0 && y <= 745 && y >= -15) {
        //         var obj = parseElements(elm.children()[0], elm.children()[1], i);
        //         items.push([x,y,obj]);
        //     }
        //     if(!elm.attr('drag-template')) elm.remove();
        // });
        // window.localStorage.customsheet = JSON.stringify(items);
        // window.localStorage.customsheetname = $scope.custom.name;
        $('#customsheet').closeModal();
        $scope.sheet = 'none';
    }

    $scope.reset = function() {
        angular.element('draggable').each(function(i,e) {
            var elm = angular.element(e);
            if(!elm.attr('drag-template')) {
                elm.remove();
            }
        });
        // delete window.localStorage.customsheet;
        // delete window.localStorage.customsheetname;
    }

    $scope.done = function() {
        var items = [];
        var names = {};
        var error = false;
        angular.element('draggable').each(function(i,e) {
            elm = angular.element(e);
            y = parseInt(elm.css('top'));
            x = parseInt(elm.css('left'));
            console.log('x',x,'y',y);
            if(x <= 745 && x >= 0 && y <= 745 && y >= -15) {
                var obj = parseElements(elm.children()[0], elm.children()[1], i);
                if(names[obj.name]) {
                    if(!error) alert('You cannot have duplicate names for your fields, please remove all duplicates.');
                    error = true;
                } else {
                    names[obj.name] = true;
                }
                items.push([x,y,obj]);
            }
            // if(!elm.attr('drag-template')) elm.remove();
        });
                // console.log(items);
        if(items.length > 0 && !error) {
            // window.localStorage.customsheet = JSON.stringify(items);
            // window.localStorage.customsheetname = $scope.custom.name;
            // var sheet = new Sheet();
            var sheet = {};
            sheet.name = $scope.custom.name;
            if($scope.custom.system !== 'any') sheet.system = $scope.custom.system;
            // sheet.forms = JSON.stringify(items);
            sheet.forms = items;
            console.log(sheet);
            // sheet.$save(function(data) {
            Sheet.create(sheet, function(data) {
                console.log(data);
                $scope.sheets[$scope.sheets.length-1] = data;
                $scope.$evalAsync(function() {
                    $scope.sheet = data.id;
                });

                $('#customsheet').closeModal();
                AlertService.alert('blue','You have created the new character sheet '+$scope.custom.name);
            });
        } else {
            if(items.length === 0 && !error) alert('You cannot save an empty sheet.');
        }
    }

    $scope.saveSheet = function() {
        if($scope.custom.name === "") {
            alert('Please enter a name for your sheet');
        } else {
            $scope.done();
        }
    }

    renameInput.focus(function() {this.select()});

    $('#custom-sheet').on('contextmenu','.template',function(e) {
        e.preventDefault();
        template = $(e.target);
        // console.log(template.is('label'))
        if(!template.is('label')) template = template.next('label');
        $scope.$evalAsync(function() {
            $scope.label.name = template.text();
        })

        console.log(template,$scope.label.name);
        $('#rename').openModal();
        renameInput.focus();
    });

    $scope.renameTemplate = function() {
        template.text($scope.label.name);
        $('#rename').closeModal();
        renameInput.blur();
    }

    $scope.cancelRename = function() {
        $('#rename').closeModal();
        renameInput.blur();
    }

    function parseElements(field,label,i) {
        var obj = {};
        switch(true) {
            case $(field).is('textarea'):
                obj.form = 'textarea';
                obj.display = 'p';
                break;
            case $(field).is('input[type="text"]'):
                obj.form = 'input-text';
                obj.display = 'b';
                break;
        }
        obj.name = $(label).text().replace(/\W/g,'');
        return obj;
    }
}]);