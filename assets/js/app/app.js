var RPGChat = angular.module('RPGChat', ['draggable','sheetItem','ngRoute','ngResource','ngSanitize']);

RPGChat.run(['$rootScope','$location','$routeParams','Game','UserService','AlertService', function($rootScope,$location,$routeParams,Game,UserService,AlertService){
    console.log('RPGChat app is loaded.');

    $rootScope.$on('$locationChangeStart', function(event,next,current) {
        // console.log('event:',event,'next:',next);
        var nextRoute = next.substr(next.indexOf(location.host) + location.host.length);
        console.log('route:',location.host,nextRoute);
        if(nextRoute.length > 1) {
            UserService.check(function(err,data){
                // console.log('check',err,data);
                if(!data.user) {
                    event.preventDefault();
                    $location.path('/');
                    AlertService.alert('red','You do not have permission to view this page. Please sign up or login.');
                } else if(next.indexOf('join') !== -1) {
                    console.log('route params',$routeParams)
                    Game.get({id:$routeParams.id}, function(data) {
                        var game = data;
                        var user = UserService.currentUser.id;

                        if(game.active && (game.public || ($routeParams.join && $routeParams.join == game.gm.id)) && game.gm.id !== user) {
                            var playing = false;
                            for(var i = 0; i < game.players.length; i++) {
                                if(game.players[i].id == user) {
                                    playing = true;
                                    break;
                                }
                            }

                            if(!playing) {
                                Game.update({id:$routeParams.id},{players:game.players.concat([UserService.currentUser])});
                                AlertService.add('green','You have joined '+game.name);
                                location.href='/game/'+$routeParams.id+'/dashboard';
                            } else {
                                AlertService.add('yellow black-text','You have already joined this game.');
                            }
                        } else {
                            console.log('game',game,'active',game.active)
                            AlertService.add('red','This game is not accepting any more players.');
                        }
                        event.preventDefault();
                        var currentRoute = current.substr(current.indexOf(location.host) + location.host.length);
                        $location.path(currentRoute);
                    });
                }
            });
        }
    });

    $rootScope.$on('$locationChangeSuccess', function(event,next,current) {
        AlertService.display();
    });
}]);

RPGChat.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider.when('/', {
        templateUrl: '/views/home.html',
        controller: 'HomeCtrl'
    }).when('/about', {
        templateUrl: '/views/about.html',
        controller: 'AboutCtrl'
    }).when('/login', {
        templateUrl: '/views/auth/login.html',
        controller: 'HomeCtrl'
    }).when('/search', {
        templateUrl: '/views/games/search.html',
        controller: 'SearchCtrl'
    }).when('/account', {
        templateUrl: '/views/auth/account.html',
        controller: 'AccountCtrl'
    }).when('/create', {
        templateUrl: '/views/games/create.html',
        controller: 'CreateGameCtrl'
    }).when('/create/sheet', {
        templateUrl: '/views/games/sheet.html',
        controller: 'CreateSheetCtrl'
    }).when('/game/:id', {
        templateUrl: '/views/games/room.html',
        controller: 'GameCtrl'
    }).when('/game/:id/archive', {
        templateUrl: '/views/games/archive.html',
        controller: 'ArchiveCtrl'
    }).when('/game/:id/dashboard', {
        templateUrl: '/views/games/dashboard.html',
        controller: 'GameDashboardCtrl'
    }).when('/game/:id/join', {}).when('/game/:id/join/:join', {
    }).when('/character/:id', {
        templateUrl: '/views/auth/character.html',
        controller: 'CharacterCtrl'
    }).otherwise({
        templateUrl: '/views/404.html'
    });
}]);