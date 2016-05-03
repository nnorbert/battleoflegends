<?php

class LoLAPI {

  // private static $api_key = "d6fd9b0b-2f9c-425b-983b-7bb21e2d85eb";
  private static $api_key;
  private static $serverInfo = array(
    "br" => array(
      'platformID' => "BR1",
      'host' => "br.api.pvp.net",
    ),
    "eune" => array(
      'platformID' => "EUN1",
      'host' => "eune.api.pvp.net",
    ),
    "euw" => array(
      'platformID' => "EUW1",
      'host' => "euw.api.pvp.net",
    ),
    "jp" => array(
      'platformID' => "JP1",
      'host' => "jp.api.pvp.net",
    ),
    "kr" => array(
      'platformID' => "KR",
      'host' => "kr.api.pvp.net",
    ),
    "lan" => array(
      'platformID' => "LA1",
      'host' => "lan.api.pvp.net",
    ),
    "las" => array(
      'platformID' => "LA2",
      'host' => "las.api.pvp.net",
    ),
    "na" => array(
      'platformID' => "NA1",
      'host' => "na.api.pvp.net",
    ),
    "oce" => array(
      'platformID' => "OC1",
      'host' => "oce.api.pvp.net",
    ),
    "ru" => array(
      'platformID' => "RU",
      'host' => "ru.api.pvp.net",
    ),
    "tr" => array(
      'platformID' => "TR1",
      'host' => "tr.api.pvp.net",
    ),
    "pbe" => array(
      'platformID' => "PBE1",
      'host' => "pbe.api.pvp.net",
    ),
  );

  public static function setApiKey($api_key) {
     LoLAPI::$api_key = $api_key;
  }

  public static function getUserByName($username, $server) {
    $url = "https://" . LoLAPI::$serverInfo[$server]['host'] . "/api/lol/" . $server . "/v1.4/summoner/by-name/" . $username . "?api_key=" . LoLAPI::$api_key;

    $result = LoLAPI::sendRequest($url);

    return $result;
  }

  public static function getChampionMasteries($playerID, $server) {
    $url = "https://" . LoLAPI::$serverInfo[$server]['host'] . "/championmastery/location/" . LoLAPI::$serverInfo[$server]['platformID'] . "/player/" . $playerID . "/champions?api_key=" . LoLAPI::$api_key;

    $result = LoLAPI::sendRequest($url);

    $user_masteries = array(
      'max_mastery_points' => 0,
      'champions' => array(),
      'mapping' => array(),
    );

    foreach ($result as $mastery) {
      if ($mastery['championPoints'] > $user_masteries['max_mastery_points']) {
        $user_masteries['max_mastery_points'] = $mastery['championPoints'];
      }
      $user_masteries['champions'][] = array(
        'championId' => $mastery['championId'],
        'championPoints' => $mastery['championPoints'],
      );
      $user_masteries['mapping'][$mastery['championId']] = $mastery['championPoints'];
    }

    return $user_masteries;
  }

  public static function getChampions($server) {
    $url = "https://global.api.pvp.net/api/lol/static-data/" . $server . "/v1.2/champion?champData=stats&api_key=" . LoLAPI::$api_key;

    $result = LoLAPI::sendRequest($url);

    $champions = array();

    foreach ($result['data'] as $champ) {
      $stats = array();
      $stats['hp'] = round($champ['stats']['hp']);
      $stats['attackdamage'] = round($champ['stats']['attackdamage']);
      $stats['crit'] = round($champ['stats']['crit']);
      $stats['blockchance'] = 0;

      $champ['stats'] = $stats;
      $champions[$champ['id']] = $champ;
    }

    return $champions;
  }

  private static function sendRequest($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($ch);

    $statuscode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if($statuscode!=200){
      return null;
    }

    curl_close($ch);

    $data = json_decode($result, true);
    return $data;
  }
}
