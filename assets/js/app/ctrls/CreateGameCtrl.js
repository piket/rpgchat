RPGChat.controller('CreateGameCtrl', ['$scope','$location','AlertService','UserService','Game','Sheet','System', function($scope,$location,AlertService,UserService,Game,Sheet,System) {
    var publicDesc = "Public games can be searched for and anyone can request to join. GMs still must approve all requests.";
    var privateDesc = "Private games cannot be searched for, GMs must send invites to players who are automatically approved if they respond yes."
    var template = null;

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

    $scope.basicParams = {
        startingX: 5,
        gridY: 10,
        gridX: 10,
        destroyX: {min:0,max:810},
        destroyY: {min:0,max:810}
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
        if(val == '556a08b5713cc6cf4056bde5') {
            val = 'none';
        }
        $scope.sheets = Sheet.query({systemId:val});
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
        var items = [];
        angular.element('draggable').each(function(i,e) {
            var elm = angular.element(e);
            var x = parseInt(elm.css('top'));
            var y = parseInt(elm.css('left'));
            console.log(x,y);
            if(x <= 745 && x >= 0 && y <= 745 && y >= -15) {
                var obj = parseElements(elm.children()[0], elm.children()[1], i);
                items.push([x,y,obj]);
            }
            if(!elm.attr('drag-template')) elm.remove();
        });
        window.localStorage.customsheet = JSON.stringify(items);
        window.localStorage.customsheetname = $scope.sheetname;
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
        delete window.localStorage.customsheet;
        delete window.localStorage.customsheetname;
    }

    $scope.done = function() {
        var items = [];
        var names = {};
        var error = false;
        angular.element('draggable').each(function(i,e) {
            elm = angular.element(e);
            x = parseInt(elm.css('top'));
            y = parseInt(elm.css('left'));
            console.log(x,y);
            if(x <= 745 && x >= 0 && y <= 745 && y >= -15) {
                var obj = parseElements(elm.children()[0], elm.children()[1], i);
                if(names[obj.name]) {
                    alert('You cannot have duplicate names for your fields, please remove all duplicates.');
                    error = true;
                    return;
                } else {
                    names[obj.name] = true;
                }
                items.push([x,y,obj]);
            }
            if(!elm.attr('drag-template')) elm.remove();
        });
        if(items.length > 0 && !error) {
            window.localStorage.customsheet = JSON.stringify(items);
            window.localStorage.customsheetname = $scope.sheetname;
            var sheet = new Sheet();
            sheet.name = $scope.sheetname;
            sheet.system = $scope.system;
            sheet.form = parseElements(items);
            sheet.$save(function(data) {
                $scope.sheets.pop();
                $scope.sheets.push(data);
                $scope.sheet = data.id;
                $('#customsheet').closeModal();
            });
        } else {
            if(items.length === 0) alert('You cannot save an empty sheet.');
        }
    }

    $scope.saveSheet = function() {
        if($scope.sheetName === "") {
            alert('Please enter a name for your sheet');
        } else {
            $scope.done();
        }
    }

    $('#custom-sheet').on('contextmenu','.template',function(e) {
        e.preventDefault();
        template = $(e.target);
        // console.log(template.is('label'))
        if(!template.is('label')) template = template.next('label');
        $scope.labelName = template.text();
        console.log(template,$scope.labelName);
        $('#rename').openModal();
        $('#rename-input').focus();
    });

    $scope.renameTemplate = function() {
        template.text($scope.labelName);
        $('#rename').closeModal();
    }

    $scope.cancelRename = function() {
        $('#rename').closeModal();
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
        if(obj.name.toLowerCase() == 'rightclicktorename') obj.name += i;
        return obj;
    }
}]);