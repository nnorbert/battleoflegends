var app = angular.module('BoLApp', []);

app
  .controller('appController', function ($scope, api, client) {
    $scope.loading = false;

    $scope.waitTimeIndex = 1;
    $scope.roundsToWin = 1;
    $scope.waitTimes = [10, 500, 1000];

    $scope.timeouts;

    // Connection object
    $scope.connection = {
      $socket: null,
      serverURL: Drupal.settings.appServer.host + ":" + Drupal.settings.appServer.port,
      connectedToServer: false,
      connectionFailed: false
    };

    // User object
    $scope.user = {
      username: '',
      server: '',
      loginError: false,
      loggedIn: false,
      masteries: null
    };

    $scope.champions = null;

    // Create a refference to child gameController
    $scope.gameCtrl = {};

    // Connect to server
    $scope.connection.$socket = client.connect($scope.connection.serverURL);
    if ($scope.connection.$socket) {
      // Waiting for everything to be ready
      waitForSocketReady();

      // Handle incomming events
      client.attach($scope);
    }
    else {
      // Failed to connect
      $scope.connection.connectionFailed = true;
    }

    // Login user
    $scope.login = function() {
      if (!$scope.user.username) {
        alert('Please, enter your username');
        return;
      }

      if (!$scope.user.server) {
        alert('Please, select a server');
        return;
      }

      $scope.loading = true;
      api.login($scope.user.username, $scope.user.server)
        .then(
          function success(data) {
            $scope.loading = false;

            if (data.success) {
              $scope.user.loggedIn = true;
              $scope.user.loginError = false;

              // Get champions
              $scope.champions = data.champions;

              // Fill user info
              $scope.user.masteries = data.masteries;
              $scope.user.info = data.userInfo;

              // Send user informations to server
              client.send($scope.connection.$socket, 'login', {
                userName: $scope.user.info.name,
                userID: $scope.user.info.id,
                masteries: $scope.user.masteries
              });
            }
            else {
              // Login error;
              $scope.user.loginError = true;
            }
          },
          function( errorMessage ) {
            $scope.loading = false;
            console.warn( errorMessage );
          }
        );
    }

    function waitForSocketReady() {
      setTimeout(function () {
        if ($scope.connection.$socket.id) {
          init();
        }
        else {
          waitForSocketReady();
        }
      }, 100);
    }

    function init() {
      // Everything is ready
    }
  })
  .controller('gameController', function ($scope, api, client) {
    $scope.gameCtrl.upgrades = null;

    $scope.gameCtrl.mode = null;

    $scope.gameCtrl.gameStatus = {
      start: true,
      championSelect: false,
      findingPlayer: false,
      battle: false,
      gameOver: false,
    };

    $scope.gameCtrl.match = {};

    $scope.gameCtrl.setUpgrades = function() {
      return {
        hp: {
          amount: 20,
          value: 150,
          valuePerNivel: 15,
          maxLevel: -1,
        },
        attackdamage: {
          amount: 10,
          value: 100,
          valuePerNivel: 15,
          maxLevel: -1,
        },
        crit: {
          amount: 5,
          value: 500,
          valuePerNivel: 20,
          maxLevel: 10,
        },
        blockchance: {
          amount: 5,
          value: 300,
          valuePerNivel: 25,
          maxLevel: 10,
        }
      };
    }

    $scope.gameCtrl.playOnline = function() {
      $scope.gameCtrl.match = {};
      $scope.gameCtrl.gameStatus.start = false;
      $scope.gameCtrl.gameStatus.championSelect = true;
      $scope.gameCtrl.mode = 'online';
    }

    $scope.gameCtrl.playAI = function() {
      $scope.gameCtrl.match = {};
      $scope.gameCtrl.gameStatus.start = false;
      $scope.gameCtrl.gameStatus.championSelect = true;
      $scope.gameCtrl.mode = 'ai';
    }

    $scope.gameCtrl.championSelected = function(champID) {
      switch ($scope.gameCtrl.mode) {
        case 'online':
          $scope.gameCtrl.gameStatus.championSelect = false;
          $scope.gameCtrl.gameStatus.findingPlayer = true;

          $scope.gameCtrl.match.rounds = {
            round: 1,
            win: 0,
            lose: 0
          };

          $scope.gameCtrl.match.player = {
            userName: $scope.user.info.name,
            userID: $scope.user.info.id,
            championID: champID,
            masteries: $scope.user.masteries.mapping[champID],
            champion: $scope.champions[champID],
          };

          // Register new game request
          client.send($scope.connection.$socket, 'newGame', {
            userName: $scope.user.info.name,
            userID: $scope.user.info.id,
            championID: champID,
            masteries: $scope.user.masteries.mapping[champID],
          });
          break;
        case 'ai':
          break;
      }
    }

    $scope.gameCtrl.battle = function() {
      $scope.gameCtrl.upgrades = $scope.gameCtrl.setUpgrades();
      $scope.gameCtrl.match.player.battleStats = {
        hp: $scope.champions[$scope.gameCtrl.match.player.championID].stats.hp,
        attackdamage: $scope.champions[$scope.gameCtrl.match.player.championID].stats.attackdamage,
        crit: $scope.champions[$scope.gameCtrl.match.player.championID].stats.crit,
        blockchance: $scope.champions[$scope.gameCtrl.match.player.championID].stats.blockchance
      };
      $scope.gameCtrl.match.player.upgradeStats = {
        hp: 0,
        attackdamage: 0,
        crit: 0,
        blockchance: 0
      };
      $scope.gameCtrl.match.player.pointsAvailable = $scope.gameCtrl.match.player.masteries;
      $scope.gameCtrl.match.player.ready = false;
      $scope.gameCtrl.match.timeRemain = 60;
      $scope.gameCtrl.match.battleStart = false;
      $scope.gameCtrl.match.roundEnd = false;

      $scope.gameCtrl.match.opponent.stats = null;

      $scope.gameCtrl.match.results = null;

      clearInterval($scope.gameCtrl.match.timer);
      $scope.gameCtrl.match.timer = setInterval(function() {
        if ($scope.gameCtrl.match.battleStart) {
          clearInterval($scope.gameCtrl.match.timer);
          return false;
        }

        if ($scope.gameCtrl.match.timeRemain > 0)
          $scope.gameCtrl.match.timeRemain--;

        if ($scope.gameCtrl.match.timeRemain == 0)
          $scope.gameCtrl.ready();

        $scope.$digest();
      }, 1000);

    }

    $scope.gameCtrl.upgrade = function(stat) {
      if ($scope.gameCtrl.match.player.pointsAvailable - $scope.gameCtrl.upgrades[stat].value >= 0
          && ($scope.gameCtrl.upgrades[stat].maxLevel == -1 || $scope.gameCtrl.match.player.upgradeStats[stat] < $scope.gameCtrl.upgrades[stat].maxLevel) ) {
        $scope.gameCtrl.match.player.battleStats[stat] += $scope.gameCtrl.upgrades[stat].amount;
        $scope.gameCtrl.match.player.pointsAvailable -= $scope.gameCtrl.upgrades[stat].value;
        $scope.gameCtrl.match.player.upgradeStats[stat]++;

        $scope.gameCtrl.upgrades[stat].value += Math.round(($scope.gameCtrl.upgrades[stat].value * $scope.gameCtrl.upgrades[stat].valuePerNivel) / 100);
      }
    }

    $scope.gameCtrl.upgradeVisible = function(stat) {
      if ($scope.gameCtrl.match.battleStart)
        return false;

      if (typeof $scope.gameCtrl.match.player == 'undefined' || typeof $scope.gameCtrl.match.player.upgradeStats == 'undefined')
        return false;

      if ($scope.gameCtrl.match.player.upgradeStats[stat] == $scope.gameCtrl.upgrades[stat].maxLevel)
        return false;

      if ($scope.gameCtrl.match.player.pointsAvailable < $scope.gameCtrl.upgrades[stat].value)
        return false;

      if ($scope.gameCtrl.match.player.ready)
        return false;

      return true;
    }

    $scope.gameCtrl.ready = function() {
      $scope.gameCtrl.match.player.ready = true;

      // Send stats
      client.send($scope.connection.$socket, 'ready', {
        matchID: $scope.gameCtrl.match.matchID,
        userID: $scope.user.info.id,
        stats: $scope.gameCtrl.match.player.battleStats
      });
    }

    $scope.gameCtrl.battleStart = function() {
      $scope.gameCtrl.match.battleStart = true;
      $scope.gameCtrl.iterateActions(0);
      $scope.$digest();
    }

    $scope.gameCtrl.iterateActions = function(index) {
      if (typeof $scope.gameCtrl.match.results == 'undefined') {
        return;
      }
      // Set active user
      jQuery('.player.active').removeClass('active');
      jQuery('.player[data-userid="' + $scope.gameCtrl.match.results[index].attacker + '"]').addClass('active');

      jQuery('.battlefront .battle-state .actions div').text('');

      // Attack
      setTimeout(function () {
        if ($scope.gameCtrl.match.results[index].crit) {
          jQuery('.battlefront .battle-state .actions div[data-userid="' + $scope.gameCtrl.match.results[index].attacker + '"]')
            .text('Critical attack!');
        }
        else {
          jQuery('.battlefront .battle-state .actions div[data-userid="' + $scope.gameCtrl.match.results[index].attacker + '"]')
            .text('Attack!');
        }

        // Defense
        setTimeout(function () {
          if ($scope.gameCtrl.match.results[index].opponentBlock) {
            jQuery('.battlefront .battle-state .actions div[data-userid="' + $scope.gameCtrl.match.results[index].opponent + '"]')
              .text('Attack blocked!');
          }
          else {
            jQuery('.battlefront .battle-state .actions div[data-userid="' + $scope.gameCtrl.match.results[index].opponent + '"]')
              .text('-' + $scope.gameCtrl.match.results[index].attack + ' HP');
              // Decrement hP
              if ($scope.gameCtrl.match.results[index].attacker == $scope.user.info.id) {
                if ($scope.gameCtrl.match.opponent.battleStats.hp - $scope.gameCtrl.match.results[index].attack > 0) {
                  $scope.gameCtrl.match.opponent.battleStats.hp -= $scope.gameCtrl.match.results[index].attack;
                }
                else {
                  $scope.gameCtrl.match.opponent.battleStats.hp = 0;
                }
              }
              else {
                if ($scope.gameCtrl.match.player.battleStats.hp - $scope.gameCtrl.match.results[index].attack > 0) {
                  $scope.gameCtrl.match.player.battleStats.hp -= $scope.gameCtrl.match.results[index].attack;
                }
                else {
                  $scope.gameCtrl.match.player.battleStats.hp = 0;
                }
              }
              $scope.$digest();
          }

          // Next action
          if (index <  $scope.gameCtrl.match.results.length - 1) {
            setTimeout(function () {
              $scope.gameCtrl.iterateActions(index + 1);
            }, $scope.waitTimes[$scope.waitTimeIndex] * 2);
          }
          else {
            // Round is over
            setTimeout(function () {
              $scope.gameCtrl.roundOver();
            }, $scope.waitTimes[$scope.waitTimeIndex] * 2);
          }

        }, $scope.waitTimes[$scope.waitTimeIndex]);
      }, $scope.waitTimes[$scope.waitTimeIndex]);
    }

    $scope.gameCtrl.roundOver = function() {
      // Reet HTML markup
      jQuery('.player.active').removeClass('active');
      jQuery('.battlefront .battle-state .actions div').text('');

      $scope.gameCtrl.match.roundEnd = true;

      if ($scope.gameCtrl.match.player.battleStats.hp > 0) {
        // Win
        $scope.gameCtrl.match.rounds.win++;
        jQuery('.battlefront .end-state .message').text('Round win!');
      }
      else {
        // Lose
        $scope.gameCtrl.match.rounds.lose++;
        jQuery('.battlefront .end-state .message').text('Round lose!');
      }

      $scope.$digest();

      if ($scope.gameCtrl.match.rounds.win == $scope.roundsToWin) {
        $scope.gameCtrl.gameOver('You win!');
      }
      else if ($scope.gameCtrl.match.rounds.lose == $scope.roundsToWin) {
        $scope.gameCtrl.gameOver('You lose!');
      }
      else {
        $scope.gameCtrl.match.rounds.round++;
        $scope.$digest();

        setTimeout(function() {
          client.send($scope.connection.$socket, 'roundOver', {
            matchID: $scope.gameCtrl.match.matchID,
            userID: $scope.user.info.id
          });
        }, 3000);
      }
    }

    $scope.gameCtrl.gameOver = function(message) {
      // Stop timer
      clearInterval($scope.gameCtrl.match.timer);
      $scope.gameCtrl.gameStatus.battle = false;
      $scope.gameCtrl.gameStatus.gameOver = true;

      jQuery('.game-over .message').text(message);

      client.send($scope.connection.$socket, 'gameOver', {
        matchID: $scope.gameCtrl.match.matchID
      });

      $scope.$digest();
    }

    $scope.gameCtrl.restart = function() {
      $scope.gameCtrl.upgrades = null;

      $scope.gameCtrl.mode = null;

      $scope.gameCtrl.gameStatus = {
        start: true,
        championSelect: false,
        findingPlayer: false,
        battle: false,
        gameOver: false,
      };

      $scope.gameCtrl.match = {};
    }
  })

  .service(
    "api",
    function( $http, $q ) {
      // Return public API.
      return({
          login: login,
      });

      // ---
      // PUBLIC METHODS.
      // ---

      function login( username, server ) {
        var request = $http({
            method: "post",
            url: Drupal.settings.basePath + "bol/login",
            data: {
                user: username,
                server: server
            }
        });
        return( request.then( handleSuccess, handleError ) );
      }

      // ---
      // PRIVATE METHODS.
      // ---
      function handleError( response ) {
        // The API response from the server should be returned in a
        // nomralized format. However, if the request was not handled by the
        // server (or what not handles properly - ex. server error), then we
        // may have to normalize it on our end, as best we can.
        if (
            ! angular.isObject( response.data ) ||
            ! response.data.message
            ) {
            return( $q.reject( "An unknown error occurred." ) );
        }
        // Otherwise, use expected error message.
        return( $q.reject( response.data.message ) );
      }
      // I transform the successful response, unwrapping the application data
      // from the API response payload.
      function handleSuccess( response ) {
        return( response.data );
      }
    })

  .service(
    "client",
    function( $http, $q ) {
      // Return public API.
      return({
          connect: connect,
          attach: attach,
          send: send
      });

      // ---
      // PUBLIC METHODS.
      // ---

      function connect( url ) {
        if (typeof io !== "undefined") {
          $socket = io.connect(url);
          return $socket;
        }
        else {
          return false;
        }
      }

      function attach( ref ) {
        // Handle connection confirmation
        ref.connection.$socket.on('connected', function (data) {
          if(data) {
            if (data.status == 1) {
              ref.connection.connectedToServer = true;
              ref.$digest();
            }
          } else {
              console.log("There is a problem:", data);
          }
        });

        // Handle player found confirmation
        ref.connection.$socket.on('playerFound', function (data) {
          ref.gameCtrl.match.opponent = data.opponent;
          ref.gameCtrl.match.opponent.champion = ref.champions[data.opponent.championID];
          ref.gameCtrl.match.opponent.battleStats = null;

          ref.gameCtrl.match.matchID = data.matchID;

          ref.gameCtrl.gameStatus.findingPlayer = false;
          ref.gameCtrl.gameStatus.battle = true;

          ref.gameCtrl.battle();

          ref.$digest();
        });

        // Battle starts
        ref.connection.$socket.on('battleStart', function (data) {
          ref.gameCtrl.match.opponent.battleStats = data.opponentStats;
          ref.$digest();
        });

        // Battle results
        ref.connection.$socket.on('battleResult', function (data) {
          ref.gameCtrl.match.results = data.result;
          ref.$digest();
          ref.gameCtrl.battleStart();
        });

        // New round
        ref.connection.$socket.on('newRound', function (data) {
          ref.gameCtrl.match.opponent.battleStats = null;
          ref.$digest();

          ref.gameCtrl.battle();
        });

        // Handle opponentDisconnected event
        ref.connection.$socket.on('opponentDisconnected', function (data) {
          ref.gameCtrl.gameOver('Your opponent disconnected.');
        });
      }

      function send( ref, event, data ) {
        // Adding user's socketID to data to be send
        data.id = ref.id;
        ref.emit(event, data);
      }
  });