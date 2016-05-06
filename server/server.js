var express = require("express");
var app = express();
var port = 8001;

// Check arguments for custom port
var args = process.argv.slice(2);
if (typeof args[0] !== "undefined") {
  // Set given port
  port = args[0];
}

// Starting server
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

var maxMasteryDiff = 2000;

// Client default object
var Client = function(socket) {
  this.socket = socket;
  this.userID = null;
  this.userName = null;
  this.masteries = null;
}

// Clients
var playersOnline = 0;
var clients = {};

// Players waiting for battle
var waitingList = [];

// Active matches
var matches = {};

// Handle connection
io.sockets.on('connection', function (socket) {

  // Register new connection
  var id = socket.id.replace("/#", "");
  clients[id] = new Client(socket);
  // Emit confirmation for client
  clients[id].socket.emit('connected', { message: 'Welcome on Battle of Legends server!', status: 1 });

  // Handle events
  // -----------------------------------------------------------------------------------

  // User login
  socket.on('login', function (data) {
    if (typeof data.id !== "undefined") {
      clients[data.id].userID = data.userID;
      clients[data.id].userName = data.userName;
      clients[data.id].masteries = data.masteries;

      playersOnline++;
      io.sockets.emit('playersOnlineStatus', {
        nr: playersOnline
      });
    }
  });

  // Registering and pairing players for battle
  socket.on('newGame', function (data) {
    if (typeof data.id !== "undefined") {
      // Check, if there are any player with a matching mastery points
      var found = false;
      var masteryDiff;
      for (var waitingUser in waitingList) {
        if (Math.abs(waitingList[waitingUser].masteries - data.masteries) <= maxMasteryDiff) {
          found = true;
          var match = {};
          match[data.userID] = data;
          match[data.userID].opponent = waitingList[waitingUser].userID;
          match[data.userID].roundOver = false;

          match[waitingList[waitingUser].userID] = waitingList[waitingUser]
          match[waitingList[waitingUser].userID].opponent = data.userID;
          match[data.userID].roundOver = false;

          var matchKey = 'match-' + data.userID + waitingList[waitingUser].userID;
          matches[matchKey] = match;

          // Confirming match found
          clients[data.id].socket.emit('playerFound', {
            matchID: matchKey,
            opponent: waitingList[waitingUser]
          });
          clients[waitingList[waitingUser].id].socket.emit('playerFound', {
            matchID: matchKey,
            opponent: data
          });

          // Remove user from waitingList
          waitingList.splice(waitingUser, 1);
        }
      }

      // Register player for waiting
      if (!found) {
        waitingList.push(data);
      }
    }
  });

  // Player is ready
  socket.on('ready', function (data) {
    matches[data.matchID][data.userID].stats = data.stats;

    // Check, if player's opponent is ready
    if (typeof matches[data.matchID][matches[data.matchID][data.userID].opponent].stats != "undefined") {
      // Start the battle
      clients[data.id].socket.emit('battleStart', {
        opponentStats: matches[data.matchID][matches[data.matchID][data.userID].opponent].stats
      });

      clients[matches[data.matchID][matches[data.matchID][data.userID].opponent].id].socket.emit('battleStart', {
        opponentStats: data.stats
      });

      // Calculate the match results
      var result = matchResults(matches[data.matchID]);

      // Send the results to players
      clients[data.id].socket.emit('battleResult', {
        result: result
      });

      clients[matches[data.matchID][matches[data.matchID][data.userID].opponent].id].socket.emit('battleResult', {
        result: result
      });
    }
  });

  socket.on('getBattleResults', function(data) {
    // Calculate the match results
    var result = matchResults(data.matchInfo);

    // Send the results to players
    clients[data.id].socket.emit('battleResult', {
      result: result
    });
  });

  socket.on('roundOver', function (data) {
    matches[data.matchID][data.userID].roundOver = true;
    delete matches[data.matchID][data.userID].stats;

    if (matches[data.matchID][ matches[data.matchID][data.userID].opponent ].roundOver) {
      matches[data.matchID][data.userID].roundOver = false;
      matches[data.matchID][ matches[data.matchID][data.userID].opponent ].roundOver = false;

      // New round
      clients[data.id].socket.emit('newRound', { });
      clients[matches[data.matchID][matches[data.matchID][data.userID].opponent].id].socket.emit('newRound', { });
    }
  });

  socket.on('gameOver', function (data) {
    if (typeof matches[data.matchID] != 'undefined')
      delete matches[data.matchID];
  });

  // Handle cancelWaiting
  socket.on('cancelWaiting', function (data) {
    // Delete from waitingList
    for (var waitingUser in waitingList) {
      if (waitingList[waitingUser].userID == data.userID) {
        waitingList.splice(waitingUser, 1);
        break;
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', function () {
    var id = socket.id.replace("/#", "");

    // Delete from waitingList
    for (var waitingUser in waitingList) {
      if (waitingList[waitingUser].id == id) {
        waitingList.splice(waitingUser, 1);
        break;
      }
    }

    // Delete from activeMatch
    for (var match in matches) {
      if (clients[id].userID in matches[match]) {
        clients[ matches[match][ matches[match][clients[id].userID].opponent ].id ].socket.emit('opponentDisconnected', {});
        delete matches[match];
      }
    }

    if (clients[id].userID !== null) {
      playersOnline--;
      io.sockets.emit('playersOnlineStatus', {
        nr: playersOnline
      });
    }

    // Delete from connected clients
    delete clients[id];
  });

});

function matchResults(match) {
  var results = [];

  var players = [];

  for (playerID in match) {
    players.push(playerID);
  }

  // Active player index
  var index = Math.floor(Math.random() * 100) % 2;

  var crit, multiplier, block;

  do {
    crit = generateChance( match[players[index]].stats.crit );
    block = generateChance( match[players[(index + 1) % 2]].stats.blockchance );

    multiplier = crit ? 2 : 1;

    results.push({
      attacker: match[players[index]].userID,
      attack: match[players[index]].stats.attackdamage * multiplier,
      crit: crit,
      opponent: match[players[(index + 1) % 2]].userID,
      opponentBlock: block
    });

    if (!block) {
      match[players[(index + 1) % 2]].stats.hp -= match[players[index]].stats.attackdamage * multiplier;
    }

    index = (index + 1) % 2;
  } while(match[players[0]].stats.hp > 0 && match[players[1]].stats.hp > 0)

  return results;
}

function generateChance(chance) {
  var chances = [];

  for (var fillIndex = 0; fillIndex < 100; fillIndex++) {
    chances.push(0);
  }

  var indexes = [];

  // Fill available indexes
  for (var i = 0; i < 100; i++) {
    indexes.push(i);
  }

  var index;

  for (var c = 0; c < chance; c++) {
    index = Math.floor(Math.random() * indexes.length);
    chances[indexes[index]] = 1;
    indexes.splice(index, 1);

  }

  var chanceIndex = Math.floor(Math.random() * 100);

  return chances[chanceIndex] == 1;
}
