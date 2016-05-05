<div class="app-wrapper clearfix" ng-app="BoLApp">
  <div ng-controller="appController">
    <div class="login-screen" ng-show="!user.loggedIn && !loading && connection.connectedToServer">
      <div class="login-error" ng-show="user.loginError">
        Sorry, we can not find you on the specified server. Please check again your username, and select the right server.
      </div>
      <div>
        <label>Enter your League of Legends username</label>
        <input type="text"
           ng-model="user.username"
           [name="username"]>
      </div>
      <div>
        <label>Choose a server</label>
        <select name="server" ng-model="user.server">
          <option value="br">BR</option>
          <option value="eune">EUNE</option>
          <option value="euw">EUW</option>
          <option value="jp">JP</option>
          <option value="kr">KR</option>
          <option value="lan">LAN</option>
          <option value="las">LAS</option>
          <option value="na">NA</option>
          <option value="oce">OCE</option>
          <option value="ru">RU</option>
          <option value="tr">TR</option>
        </select>
      </div>
      <div class="button" ng-click="login()">Login</div>
    </div>

    <div ng-controller="gameController">
      <div class="game-screen" ng-show="user.loggedIn && !loading && connection.connectedToServer">
        <!-- START SCREEN -->
        <div class="game-modes" ng-show="gameCtrl.gameStatus.start">
          <div class="play-online" ng-click="gameCtrl.playOnline()">PLAY ONLINE</div>
          <div class="play-ai" ng-click="gameCtrl.playAI()">PLAY WITH AI</div>

          <div>{{ playersOnline }} online players.</div>
        </div>

        <!-- CHAMPION SEELCT SCREEN -->
        <div class="champion-list" ng-show="gameCtrl.gameStatus.championSelect">
          <div class="champions">
            <div class="champion clearfix" ng-repeat="champ in user.masteries.champions" ng-click="gameCtrl.championSelected(champ.championId)">
              <div class="champion-pic floating">
                <img ng-src="http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/{{ champions[champ.championId].key }}.png">
              </div>
              <div class="champion-info floating">
                <div class="champion-name">{{ champions[champ.championId].name }}</div>
                <div class="champion-mastery-pt">{{ champ.championPoints }} Points</div>
              </div>
            </div>
          </div>
        </div>


        <!-- FINDING PLAYER SCREEN -->
        <div class="finding-player" ng-show="gameCtrl.gameStatus.findingPlayer">
          <div class="message">Waiting for another player...</div>
          <div class="button" ng-click="gameCtrl.cancelWaiting()">Cancel</div>
        </div>

        <!-- BATTLE SCREEN -->
        <div class="battle clearfix" ng-show="gameCtrl.gameStatus.battle">
          <div class="player floating" data-userid="{{ gameCtrl.match.player.userID }}">
            <div class="player-name">
              {{ gameCtrl.match.player.userName }}
            </div>
            <div class="player-wins">
              {{ gameCtrl.match.rounds.win }}
            </div>
            <div class="champion-details">
              <div class="champion-pic">
                <img ng-src="http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/{{ gameCtrl.match.player.champion.key }}.png">
              </div>
              <div class="champion-name">
                {{ gameCtrl.match.player.champion.name }}
              </div>
              <div class="points" ng-show="!gameCtrl.match.player.ready">Points available: {{ gameCtrl.match.player.pointsAvailable }}</div>
              <div class="champion-stats">
                <div class="hp">
                  <span class="stat-name">Health</span>
                  <span class="stat-value">{{ gameCtrl.match.player.battleStats.hp }}</span>
                  <span class="upgrade"
                    ng-click="gameCtrl.upgrade('hp')"
                    ng-show="gameCtrl.upgradeVisible('hp')">
                      +{{ gameCtrl.upgrades.hp.amount }} HP ({{ gameCtrl.upgrades.hp.value }} points)
                  </span>
                </div>
                <div class="ad">
                  <span class="stat-name">Attack damage</span>
                  <span class="stat-value">{{ gameCtrl.match.player.battleStats.attackdamage }}</span>
                  <span class="upgrade"
                    ng-click="gameCtrl.upgrade('attackdamage')"
                    ng-show="gameCtrl.upgradeVisible('attackdamage')">
                      +{{ gameCtrl.upgrades.attackdamage.amount }} AD ({{ gameCtrl.upgrades.attackdamage.value }} points)
                  </span>
                </div>
                <div class="crit">
                  <span class="stat-name">Critical chance</span>
                  <span class="stat-value">{{ gameCtrl.match.player.battleStats.crit }}%</span>
                  <span class="upgrade"
                    ng-click="gameCtrl.upgrade('crit')"
                    ng-show="gameCtrl.upgradeVisible('crit')">
                      +{{ gameCtrl.upgrades.crit.amount }} Critical ({{ gameCtrl.upgrades.crit.value }} points)
                  </span>
                </div>
                <div class="block">
                  <span class="stat-name">Block chance</span>
                  <span class="stat-value">{{ gameCtrl.match.player.battleStats.blockchance }}%</span>
                  <span class="upgrade"
                    ng-click="gameCtrl.upgrade('blockchance')"
                    ng-show="gameCtrl.upgradeVisible('blockchance')">
                      +{{ gameCtrl.upgrades.blockchance.amount }} Block ({{ gameCtrl.upgrades.blockchance.value }} points)
                  </span>
                </div>
              </div>
              <div class="ready button" ng-show="!$scope.gameCtrl.match.battleStart && !gameCtrl.match.player.ready" ng-click="gameCtrl.ready()">Ready</div>
            </div>
          </div>
          <div class="battlefront floating">
            <div class="rounds">Round {{ gameCtrl.match.rounds.round }}</div>
            <div class="champ-up-state" ng-show="!gameCtrl.match.battleStart && !gameCtrl.match.roundEnd">
              <div>Upgrade your champion</div>
              <div class="timer">
                {{ gameCtrl.match.timeRemain }}
              </div>
            </div>
            <div class="battle-state" ng-show="gameCtrl.match.battleStart && !gameCtrl.match.roundEnd">
              <div>Battle</div>
              <div class="actions clearfix">
                <div class="action-container floating" data-userid="{{ gameCtrl.match.player.userID }}"></div>
                <div class="action-container floating" data-userid="{{ gameCtrl.match.opponent.userID }}"></div>
              </div>
            </div>
            <div class="end-state" ng-show="gameCtrl.match.roundEnd">
              <div class="message"></div>
            </div>
          </div>
          <div class="player floating" data-userid="{{ gameCtrl.match.opponent.userID }}">
            <div class="player-name">
              {{ gameCtrl.match.opponent.userName }}
            </div>
            <div class="player-wins">
              {{ gameCtrl.match.rounds.lose }}
            </div>
            <div class="champion-details">
              <div class="champion-pic">
                <img ng-src="http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/{{ gameCtrl.match.opponent.champion.key }}.png">
              </div>
              <div class="champion-name">
                {{ gameCtrl.match.opponent.champion.name }}
              </div>
              <div class="champion-stats" ng-show="gameCtrl.match.opponent.battleStats">
                <div class="hp">
                  <span class="stat-name">Health</span>
                  <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.hp }}</span>
                </div>
                <div class="ad">
                  <span class="stat-name">Attack damage</span>
                  <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.attackdamage }}</span>
                </div>
                <div class="crit">
                  <span class="stat-name">Critical chance</span>
                  <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.crit }}%</span>
                </div>
                <div class="block">
                  <span class="stat-name">Block chance</span>
                  <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.blockchance }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- GAME OVER SCREEN -->
        <div class="game-over" ng-show="gameCtrl.gameStatus.gameOver">
          <div class="message"></div>
          <div class="back button" ng-click="gameCtrl.restart()">Back</div>
        </div>
      </div>
    </div>

    <div class="loading" ng-show="loading && connection.connectedToServer">Loading ...</div>
    <div class="connection-screen" ng-show="!connection.connectedToServer && !connection.connectionFailed">
      Connecting to server ...
    </div>
    <div class="connection-failed" ng-show="connection.connectionFailed">
      Connection failed. Please try agan later!
    </div>
  </div>
</div>
