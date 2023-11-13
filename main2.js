const express = require('express');
const querystring = require('querystring');
const request = require('request');
const { DateTime } = require('luxon');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
    session({
        secret: 'a27b89cc9ecc476ba75a6d939f0f115c',
        resave: false,
        saveUninitialized: true,
    })
);
app.set('view engine', 'ejs');

const CLIENT_ID = 'ac741c3507aa4edc81755b589eef91e4';
const CLIENT_SECRET = 'a27b89cc9ecc476ba75a6d939f0f115c';
const REDIRECT_URI = 'http://localhost:5000/callback';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1/';

const list = document.getElementById('list');
const cover = document.getElementById('cover');
cover.classList.add("hide");

app.get('/', (req, res) => {
    res.send("Welcome to my Spotify app <a href='/login'>Login with Spotify</a>");
});

app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email user-top-read';
    const params = {
        client_id: CLIENT_ID,
        response_type: 'code',
        scope,
        redirect_uri: REDIRECT_URI,
        show_dialog: true,
    };
    const authUrl = `${AUTH_URL}?${querystring.stringify(params)}`;
    res.redirect(authUrl);
});

app.get('/callback', (req, res) => {
    if (req.query.error) {
        return res.json({ error: req.query.error });
    }
    if (req.query.code) {
        const reqBody = {
            code: req.query.code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        };
        request.post({ url: TOKEN_URL, form: reqBody }, (error, response, body) => {
            const tokenInfo = JSON.parse(body);
            req.session.access_token = tokenInfo.access_token;
            req.session.refresh_token = tokenInfo.refresh_token;
            req.session.expires_at = DateTime.now().toSeconds() + tokenInfo.expires_in;
            res.redirect('/main');
        });
    }
});

app.get('/main', (req, res) => {
    res.render('logged');
});

app.get('/playlists', (req, res) => {
    if (!req.session.access_token) {
        return res.redirect('/login');
    }
    if (DateTime.now().toSeconds() > req.session.expires_at) {
        return res.redirect('/refresh-token');
    }
    const headers = {
        Authorization: `Bearer ${req.session.access_token}`,
    };
    request.get({ url: `${API_BASE_URL}me/playlists`, headers: headers }, (error, response, body) => {
        const playlists = JSON.parse(body);
        res.json(playlists);
    });
});

app.route('/top_items')
    .get((req, res) => {
        if (!req.session.access_token) {
            return res.redirect('/login');
        }
        if (DateTime.now().toSeconds() > req.session.expires_at) {
            return res.redirect('/refresh-token');
        }
        res.render('top_items');
    })
    .post((req, res) => {
        if (!req.session.access_token) {
            return res.redirect('/login');
        }
        if (DateTime.now().toSeconds() > req.session.expires_at) {
            return res.redirect('/refresh-token');
        }
        const type = req.body.type;
        const time_range = req.body.time_range;
        const headers = {
            Authorization: `Bearer ${req.session.access_token}`,
        };
        const url = `${API_BASE_URL}me/top/${type}?time_range=${time_range}`;
        request.get({ url, headers }, (error, response, body) => {
            const topItems = JSON.parse(body);
            res.render('top_items', { topItems });
        });
    });

app.get('/refresh-token', (req, res) => {
    if (!req.session.refresh_token) {
        return res.redirect('/login');
    }
    if (DateTime.now().toSeconds() > req.session.expires_at) {
        const reqBody = {
            'grant-type': 'refresh_token',
            refresh_token: req.session.refresh_token,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        };
        request.post({ url: TOKEN_URL, form: reqBody }, (error, response, body) => {
            const newTokenInfo = JSON.parse(body);
            req.session.access_token = newTokenInfo.access_token;
            req.session.expires_at = DateTime.now().toSeconds() + newTokenInfo.expires_in;
            res.redirect('/top_artists');
        });
    }
});


function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
    xhr.send(body);
    xhr.onload = callback;
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

function get_top_items() {
    app.get((res, req) => {
        if (!req.session.access_token) {
            return res.redirect('/login');
        }
        if (DateTime.now().toSeconds() > req.session.expires_at) {
            return res.redirect('/refresh-token');
        }
        display_top_items();
    })
}

function display_top_items() {
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

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
