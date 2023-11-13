var REDIRECT_URI = "http://localhost:5000/logged";
var CLIENT_ID = "ac741c3507aa4edc81755b589eef91e4";
var CLIENT_SECRET = "a27b89cc9ecc476ba75a6d939f0f115c";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE_URL = "https://api.spotify.com/v1/";

const list = document.getElementById('list');
const cover = document.getElementById('cover');
cover.classList.add("hide");

function authorize() {
    let url = AUTH_URL;
    url += "?client_id=" + CLIENT_ID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(REDIRECT_URI);
    url += "&show-dialog=true";
    url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read";
    window.location.href = url;
}

function onPageLoad() {
  if (window.location.search.length > 0) {
    handleRedirect();
  } else {
    getSongs();
  }
}

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("","", REDIRECT_URI);
}

function getCode() {
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get('code');
  }
  return code;
}

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(REDIRECT_URI);
  body += "&client_id=" + CLIENT_ID;
  body += "&client_secret=" + CLIENT_SECRET;
  callAuthApi(body);
}

function callAuthApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN_URL, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + btoa(CLIENT_ID + ":" + CLIENT_SECRET));
  xhr.send(body);
  xhr.onload = handleAuthResponse;
}

function refreshAccessToken() {
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + CLIENT_ID;
  callAuthApi(body);
}

function handleAuthResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);    
    }

    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    getSongs();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function getSongs() {
  callApi("GET", "https://api.spotify.com/v1/me/top/tracks", null, handleSongResponse);
}

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
  xhr.send(body);
  xhr.onload = callback;
}

function handleSongResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    songList();
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function handleArtistResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    artistList();
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function songList() {
  removeItem();
  cover.classList.remove('hide');
  for (i = 0; i < data.items.length; i++) {
    const list_item = document.createElement('div');
    const list_text = document.createElement('div');
    const song = document.createElement('div');
    const artist_album = document.createElement('div');
    const img = document.createElement('img');
    const span = document.createElement('span');
    const popu = document.createElement('div');
    const ref = document.createElement('a');
    const link = document.createTextNode("Link to Spotify");
    ref.appendChild(link);
    ref.title = "Link to Spotify";
    ref.href = data.item[i].external_urls.spotify;

    list_item.classList.add("list-item");
    list_text.classList.add("list-text");
    song.classList.add("song");
    artist_album.classList.add("artist-album");
    ref.classList.add("links");
    ref.setAttribute('target', 'blank');
    popu.classList.add("popu");
    img.classList.add("resize");

    var li = document.createElement('li');
    img.src = data.items[i].album.images[i].url;

    popu.innerHTML = "Popularity Rating: " + data.items[i].popularity;
    span.innerHTML = data.items[i].name; 
    artist_album.innerHTML = data.items[i].album.name + " - " + data.items[i].artists[0].name;

    song.appendChild(span);

    list_text.appendChild(song);
    list_text.appendChild(artist_album);
    list_text.appendChild(popu);
    list_text.appendChild(ref);
    list_text.appendChild(list_text);
    list_text.appendChild(img);
    li.appendChild(list_item);

    list.appendChild(li);
  }
}

function removeItem() {
  list.innerHTML = '';
}

function getArtists() {
  callApi("GET", "https://api.spotify.com/v1/me/top/artists", null, handleArtistResponse);
}

function artistList() {
  removeItem();
  cover.classList.remove('hide');
  for (i = 0; i < data.items.length; i++) {
    const list_item = document.createElement('div');
    const list_text = document.createElement('div');
    const song = document.createElement('div');
    const artist_album = document.createElement('div');
    const img = document.createElement('img');
    const span = document.createElement('span');
    const popu = document.createElement('div');
    const ref = document.createElement('a');
    const link = document.createTextNode("Link to Spotify");
    ref.appendChild(link);
    ref.title = "Link to Spotify";
    ref.href = data.item[i].external_urls.spotify;

    list_item.classList.add("list-item");
    list_text.classList.add("list-text");
    artist.classList.add("artist");
    genre.classList.add("genre");
    ref.classList.add("links");
    ref.setAttribute('target', 'blank');
    popu.classList.add("popu");
    img.classList.add("resize");

    var li = document.createElement('li');
    img.src = data.items[i].album.images[i].url;

    popu.innerHTML = "Popularity Rating: " + data.items[i].popularity;
    span.innerHTML = data.items[i].name; 
    for (j = 0; j < data.items[i].genres.length; i++) {
      if (j > 1) {
        break;
      } else if (j == 1) {
        genres.innerHTML = genres.innerHTML + " - " + data.items[i].genres[j];
      } else {
        genres.innerHTML = data.items[i].genres[j];
      }
    }

    artist.appendChild(span);

    list_text.appendChild(artist);
    list_text.appendChild(genres);
    list_text.appendChild(popu);
    list_text.appendChild(ref);
    list_text.appendChild(list_text);
    list_text.appendChild(img);
    li.appendChild(list_item);

    list.appendChild(li);
  }
}