<div class="app-wrapper clearfix" ng-app="BoLApp">
  <div class="app-content" ng-controller="appController">
    <div ng-hide="instructionScreen">
      <div class="login-screen clearfix" ng-show="!user.loggedIn && !loading && connection.connectedToServer">
        <div class="login-error" ng-show="user.loginError">
          Sorry, we can not find you on the specified server. Please check again your username, and select the right server.
        </div>
        <div>
          <label>Enter your League of Legends username</label>
          <input type="text"
             ng-model="user.username"
             name="username">
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
        <div class="submit-login button" ng-click="login()">Login</div>
      </div>

      <div ng-controller="gameController">
        <div class="game-screen" ng-show="user.loggedIn && !loading && connection.connectedToServer">
          <!-- START SCREEN -->
          <div class="welcome" ng-show="gameCtrl.gameStatus.start">Welcome {{user.info.name}}</div>
          <div class="game-modes" ng-show="gameCtrl.gameStatus.start">
            <div class="clearfix">
              <div class="mode play-online" ng-click="gameCtrl.playOnline()">PLAY ONLINE</div>
              <div class="mode play-ai" ng-click="gameCtrl.playAI()">PLAY WITH AI</div>
            </div>
            <div class="online-players">{{ playersOnline == 1 ? playersOnline + " online player" : playersOnline + " online players" }}</div>
          </div>

          <!-- CHAMPION SEELCT SCREEN -->
          <div class="champion-list clearfix" ng-show="gameCtrl.gameStatus.championSelect">
            <div class="clearfix">
              <div class="title"><strong>Select a champion</strong></div>
              <div class="back-button" ng-click="gameCtrl.backToHome()">back</div>
            </div>
            <div class="champions">
              <div class="champion clearfix" ng-repeat="champ in user.masteries.champions" ng-click="gameCtrl.championSelected(champ.championId)">
                <div class="champion-pic floating">
                  <img ng-src="http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/{{ champions[champ.championId].key }}.png">
                </div>
                <div class="champion-info floating">
                  <div class="champion-name">{{ champions[champ.championId].name }}</div>
                  <div class="champion-mastery-pt">Mastery points: <strong>{{ champ.championPoints }}</strong></div>
                </div>
              </div>
            </div>
          </div>


          <!-- FINDING PLAYER SCREEN -->
          <div class="finding-player" ng-show="gameCtrl.gameStatus.findingPlayer">
            <div class="message center-text">Waiting for another player...</div>
            <div class="button" ng-click="gameCtrl.cancelWaiting()">Cancel</div>
          </div>

          <!-- BATTLE SCREEN -->
          <div class="battle clearfix" ng-show="gameCtrl.gameStatus.battle">
            <div class="player" data-userid="{{ gameCtrl.match.player.userID }}">
              <div class="player-name">
                {{ gameCtrl.match.player.userName }}
              </div>
              <div class="champion-details">
                <div class="champion-pic">
                  <img ng-src="http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/{{ gameCtrl.match.player.champion.key }}.png">
                </div>
                <div class="champion-name">
                  {{ gameCtrl.match.player.champion.name }}
                </div>
                <div class="points" ng-show="!gameCtrl.match.player.ready"><strong>MP: {{ gameCtrl.match.player.pointsAvailable }}</strong></div>
                <div class="hp-bar" ng-show="gameCtrl.match.battleStart">
                  <div class="hp" style="width: {{ gameCtrl.match.player.battleStats.hp * 100 / gameCtrl.match.player.battleStats.initialHP }}%;"></div>
                </div>
                <div class="champion-stats">
                  <div class="hp clearfix">
                    <div class="stat-name">Health</div>
                    <span class="stat-value">{{ gameCtrl.match.player.battleStats.hp }}</span>
                    <span class="upgrade"
                      ng-click="gameCtrl.upgrade('hp')"
                      ng-show="gameCtrl.upgradeVisible('hp')">
                        <span class="up-bttn" ng-class="getStatActivityClass('hp')"></span>
                        <span class="up-txt">+{{ gameCtrl.upgrades.hp.amount }} HP ({{ gameCtrl.upgrades.hp.value }} points)</span>
                    </span>
                  </div>
                  <div class="ad clearfix">
                    <div class="stat-name">Attack damage</div>
                    <span class="stat-value">{{ gameCtrl.match.player.battleStats.attackdamage }}</span>
                    <span class="upgrade"
                      ng-click="gameCtrl.upgrade('attackdamage')"
                      ng-show="gameCtrl.upgradeVisible('attackdamage')">
                        <span class="up-bttn" ng-class="getStatActivityClass('attackdamage')"></span>
                        <span class="up-txt">+{{ gameCtrl.upgrades.attackdamage.amount }} Attack damage ({{ gameCtrl.upgrades.attackdamage.value }} points)</span>
                    </span>
                  </div>
                  <div class="crit clearfix">
                    <div class="stat-name">Critical chance</div>
                    <span class="stat-value">{{ gameCtrl.match.player.battleStats.crit }}%</span>
                    <span class="upgrade"
                      ng-click="gameCtrl.upgrade('crit')"
                      ng-show="gameCtrl.upgradeVisible('crit')">
                        <span class="up-bttn" ng-class="getStatActivityClass('crit')"></span>
                        <span class="up-txt">+{{ gameCtrl.upgrades.crit.amount }}% Critical chance ({{ gameCtrl.upgrades.crit.value }} points)</span>
                    </span>
                  </div>
                  <div class="block clearfix">
                    <div class="stat-name">Block chance</div>
                    <span class="stat-value">{{ gameCtrl.match.player.battleStats.blockchance }}%</span>
                    <span class="upgrade"
                      ng-click="gameCtrl.upgrade('blockchance')"
                      ng-show="gameCtrl.upgradeVisible('blockchance')">
                        <span class="up-bttn" ng-class="getStatActivityClass('blockchance')"></span>
                        <span class="up-txt">+{{ gameCtrl.upgrades.blockchance.amount }}% Block chance ({{ gameCtrl.upgrades.blockchance.value }} points)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="battlefront floating">
              <div class="top clearfix">
                <div class="player-wins">
                  <div>wins</div>
                  <div>{{ gameCtrl.match.rounds.win }}</div>
                </div>
                <div class="rounds">Round {{ gameCtrl.match.rounds.round }}</div>
                <div class="player-wins opponent">
                  <div>wins</div>
                  <div>{{ gameCtrl.match.rounds.lose }}</div>
                </div>
              </div>
              <div class="champ-up-state" ng-show="!gameCtrl.match.battleStart && !gameCtrl.match.roundEnd">
                <div class="message">Upgrade your champion</div>
                <div class="timer">
                  {{ gameCtrl.match.timeRemain }} {{ gameCtrl.match.timeRemain == 1 ? 'second' : 'seconds' }} remainning
                </div>
              </div>
              <div class="battle-state" ng-show="gameCtrl.match.battleStart && !gameCtrl.match.roundEnd">
                <div class="message">Battle</div>
                <div class="actions clearfix">
                  <div class="action-container" data-userid="{{ gameCtrl.match.player.userID }}"></div>
                  <div class="action-container opponent" data-userid="{{ gameCtrl.match.opponent.userID }}"></div>
                </div>
              </div>
              <div class="end-state" ng-show="gameCtrl.match.roundEnd">
                <div class="message"></div>
                <div class="text">The next round immediately begins</div>
              </div>
            </div>
            <div class="player opponent" data-userid="{{ gameCtrl.match.opponent.userID }}">
              <div class="player-name">
                {{ gameCtrl.match.opponent.userName }}
              </div>
              <div class="champion-details">
                <div class="champion-pic">
                  <img ng-src="http://ddragon.leagueoflegends.com/cdn/6.8.1/img/champion/{{ gameCtrl.match.opponent.champion.key }}.png">
                </div>
                <div class="champion-name">
                  {{ gameCtrl.match.opponent.champion.name }}
                </div>
                <div class="points" ng-show="!gameCtrl.match.player.ready"></div>
                <div class="hp-bar" ng-show="gameCtrl.match.battleStart">
                  <div class="hp" style="width: {{ gameCtrl.match.opponent.battleStats.hp * 100 / gameCtrl.match.opponent.battleStats.initialHP }}%;"></div>
                </div>
                <div class="champion-stats" ng-show="gameCtrl.match.opponent.battleStats">
                  <div class="hp clearfix">
                    <div class="stat-name">Health</div>
                    <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.hp }}</span>
                  </div>
                  <div class="ad clearfix">
                    <div class="stat-name">Attack damage</div>
                    <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.attackdamage }}</span>
                  </div>
                  <div class="crit clearfix">
                    <div class="stat-name">Critical chance</div>
                    <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.crit }}%</span>
                  </div>
                  <div class="block clearfix">
                    <div class="stat-name">Block chance</div>
                    <span class="stat-value">{{ gameCtrl.match.opponent.battleStats.blockchance }}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ready button" ng-show="!$scope.gameCtrl.match.battleStart && !gameCtrl.match.player.ready" ng-click="gameCtrl.ready()">Ready</div>
          </div>

          <!-- GAME OVER SCREEN -->
          <div class="game-over" ng-show="gameCtrl.gameStatus.gameOver">
            <div class="message"></div>
            <div class="back button" ng-click="gameCtrl.restart()">Back</div>
          </div>
        </div>
      </div>

      <div class="loading center-text" ng-show="loading && connection.connectedToServer">Loading ...</div>
      <div class="connection-screen center-text" ng-show="!connection.connectedToServer && !connection.connectionFailed">
        Connecting to server ...
      </div>
      <div class="connection-failed center-text" ng-show="connection.connectionFailed">
        Connection failed. Please try agan later!
      </div>
    </div>
    <div class="instructions" ng-show="instructionScreen">
      <div class="close-instructions" ng-click="closeInstructions()">X</div>
      <h2>How to play</h2>
      <p>This game use the original chmapions, and their stats from the League of Legends, provided by the Riot Games API. You can play with any champion, which has champion mastery points. These point will be used to upgrade your champ, so choose a champion with the most of mastery points for a higher chance of victory.</p>

      <p>You can play online with another players, or with AI. If you play online, you will be paired with a player, who have almost the same mastery points, the acceptable difference in points is 2000 mastery points.</p>

      <p>Once you selected your champion and another player was found, the battle begins. To win the battle, you have to win 2 of 3 rounds.</p>

      <p>In every round you have a maximum of 60 second to upgrade your champion. You can upgrade the basic stats of your champion, like:</p>
      <ul>
       <li><strong>Health</strong></li>
       <li><strong>Attack damage</strong></li>
       <li><strong>Critical chance</strong></li>
       <li><strong>Block chance</strong></li>
      </ul>

      <p>Every champion is equal, there is no difference in special passive abilitys, the only relevant things are the champion's attack damage and health.</p>

      <p>With every upgrade, the cost of the next upgrade for the selected stat will increase. Some stats have a maximum level, like critical chance, and block chance, these stats can be upgraded to a maximum of 50%.</p>

      </p>After the champion upgrade, the fight will be done automatically based on your stats, after that, the next round will begin. If you win 2 rounds, you win the match.</p>
    </div>
    <div class="how-to-play" ng-click="openInstructions()">
      <spam class="text">How to play?</span>
    </div>
  </div>
</div>


