RPGChat.controller('CreateGameCtrl', ['$scope','$location','AlertService','UserService','Game','Sheet','System', function($scope,$location,AlertService,UserService,Game,Sheet,System) {
    var publicDesc = "Public games can be searched for and anyone can request to join. GMs still must approve all requests.";
    var privateDesc = "Private games cannot be searched for, GMs must send invites to players who are automatically approved if they respond yes."

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

    $('#confirm-modal').leanModal({
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
            if(x <= 225 && x >= 25 && y <= 225 && y >= 25) {
                items.push([x,y,elm.html()]);
            }
            elm.remove();
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
        angular.element('draggable').each(function(i,e) {
            elm = angular.element(e);
            x = parseInt(elm.css('top'));
            y = parseInt(elm.css('left'));
            console.log(x,y);
            if(x <= 225 && x >= 25 && y <= 225 && y >= 25) {
                items.push([x,y,elm.html()]);
            }
            elm.remove();
        });
        window.localStorage.customsheet = JSON.stringify(items);
        window.localStorage.customsheetname = $scope.sheetname;
        var sheet = new Sheet();
        sheet.name = $scope.sheetname;
        sheet.system = $scope.system;
        sheet.form = items;
        sheet.$save(function(data) {
            $scope.sheets.pop();
            $scope.sheets.push(data);
            $scope.sheet = data.id;
            $('#customsheet').closeModal();
        });
    }
}]);