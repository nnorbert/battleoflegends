# Battle of Legends

Battle of Legends is a multiplayer logical game, based on the League of Legends from Riot Games, and it is using the Riot Games API.

## Installation guide

The Battle of Legends is an AngularJS application, with Drupal in backend and Node.js as application server.

### 1. Get the codebase

Clone this repo into your web server's root directory. Tested with Apache2 with Php 5.4 on Ubuntu 14.04 and 5.5 Windows 8.1.

### 2. Install Drupal

You can install this Drupal project as a new one, or just import the attached MySQL dump. If you choose to import the given dump, the project will be setted up, but you still have to edit the settings.php with your personal API key and the application server's address.

* First of all, you have to create in your project's sites/default folder a new folder, named **files**, and copy the **default.setting.php** file, and rename it to **settings.php**. You have to give writing permission on the files folder and the settings.php file.

* Next, create a new database, preferable to use **utf8_general_ci** as the collation. If you want to use the given dump, follow the instructions in the next step, otherwise skip it.

* Import the dump in your new database. The site's admin user and password is set to:
⋅⋅⋅user: **admin**
⋅⋅⋅password: **admin**

Next, overwrite the settings.php from your **sites/default/** folder with the settings.php fromp the **dump** folder, and edit the database settings with your database name and connection credentials. Access the site's login page (http://localhost/battleoflegends/user), log in, and clear the cache. The next step is not relevant for you, just skip it.

* Access the site in your browser, you will see the Drupal installation section. Just follow the given instructions, and install it. Once the installation is finished, you have to enable the **battle_of_legends** module and the **jQuery Update** module in the modules section, and enable the battle_of_legends theme in the appearance section (just enable, do not set as default theme). Then, set the default front page to **bol**, witch is the game's URL, in the following link **http://localhost/battleoflegends/admin/config/system/site-information**.

* **Set up your API KEY and the application server's address**
Open your **settings.php** from the sites/default/ folder, and add the following variables filled with the correct informations
```php
$conf['application_server_host'] = 'http://127.0.0.1';
$conf['application_server_port'] = 8000;
$conf['lol_api_key'] = 'your_api_key';
```

### 3. Install and set up the Node.js application server
This project was realised using the 4.4.3 version of Node.js. This version is recommended for use, because with older versions of Node.js, like 0.X, may be compatibility problems.

The Node.js server realizes the real-time connection between players in multiplayer mode.

* Install the Node.js LTS version from [https://nodejs.org](https://nodejs.org).
* In this repo, you will find a folder, named **server**. Open a terminal, and change in there, so the **server.js** file will be found. This server application uses two Node.js modules, the **express** and the **socket.io**. These modules are downloaded, it is not necessary to pay attention to install them.
* Start up the server with the following command:
**node server.js**

The default port for the server is 8000. If you want to set another port, you can do it by passing the port number as a parameter to the server. The following code will start the server to listen on 8080 port:
**node server.js 8080**

If everything is setted up correctly, you have to see the login screen on the game's page.

## How to play
This game use the original chmapions, and their stats from the League of Legends, provided by the Riot Games API. You can play with any champion, which has champion mastery points. These point will be used to upgrade your champ, so choose a champion with the most of mastery points for a higher chance of victory.

You can play online with another players, or with AI. If you play online, you will be paired with a player, who have almost the same mastery points, the acceptable difference in points is 2000 mastery points.

Once you selected your champion and another player was found, the battle begins. To win the battle, you have to win 2 of 3 rounds.

In every round you have a maximum of 60 second to upgrade your champion. You can upgrade the basic stats of your champion, like:

* **Health**
* **Attack damage**
* **Critical chance**
* **Block chance**

Every champion is equal, there is no difference in special passive abilitys, the only relevant things are the champion's attack damage and health.

With every upgrade, the cost of the next upgrade for the selected stat will increase.
Some stats have a maximum level, like critical chance, and block chance, these stats can be upgraded to a maximum of 50%.

After the champion upgrade, the fight will be done automatically based on your stats, after that, the next round will begin. If you win 2 rounds, you win the match.
