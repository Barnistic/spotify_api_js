const { time } = require('console');
const path = require('path');
const express = require('express');
const session = require('express-session');
const querystring = require('querystring');
const request = require('request');
require('dotenv').config();

const app = express();
const port = 5000;

const CLIENT_ID = 'ac741c3507aa4edc81755b589eef91e4';
const REDIRECT_URI = 'http://localhost:' + port + '/callback';
const CLIENT_SECRET = process.env.secretKey;

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1/';

app.use(session({
    secret: CLIENT_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, '/views')));

app.use('/client.js', express.static(path.join(__dirname, 'client.js')));

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

        console.log("Callback code received.");

        const reqBody = {
            code: req.query.code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
        };

        const reqHeader = {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        }

        request.post({ url: TOKEN_URL, form: reqBody, headers: reqHeader }, (error, response, body) => {
            const tokenInfo = JSON.parse(body);
            session.access_token = tokenInfo.access_token;
            session.refresh_token = tokenInfo.refresh_token;

            const tokenExpiresInSeconds = tokenInfo.expires_in;
            const currentTimeMilliseconds = new Date().getTime();
            const expirationTimeMilliseconds = currentTimeMilliseconds + (tokenExpiresInSeconds * 1000);
            
            session.expires_at = expirationTimeMilliseconds;
            res.redirect('/logged');
        });
    }
});

app.get('/logged', (req, res) => {
    res.sendFile(__dirname + "/views/logged.html");
    console.log("Successfull login");
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

app.get('/get-top-items', (req, res) => {
    const type = req.query.type;
    const time_range = req.query.time_range;

    console.log("get-top-items call with type: " + type + " and time_range: " + time_range);
    const apiUrl = API_BASE_URL + "me/top/" + type + "?limit=50&time_range=" + time_range;

    request.get({
        url: apiUrl,
        headers: {
            'Authorization': 'Bearer ' + session.access_token
        }
    }, (error, response, body) => {
        if (error) {
            res.json({ error });
        } else {
            let data = JSON.parse(body);
            if (data?.items) {
                if (type === 'tracks') {
                    let albumCounts = {};
                    data.items.forEach(function(item) {
                        const albumName = item.album.name;
                        if (albumCounts[albumName]) {
                            albumCounts[albumName]++;
                        } else {
                            albumCounts[albumName] = 1;
                        }
                    });
    
                    let topAlbums = Object.keys(albumCounts).sort(function(a, b) {
                        return albumCounts[b] - albumCounts[a];
                    }).map(function(albumName) {
                        return { name: albumName, count: albumCounts[albumName] };
                    });
    
                    const tracks = data.items;
                    res.json({ tracks, albums: topAlbums });
                } else if (type === 'artists') {
                    const artists = data.items;
                    res.json({ artists });
                } else {
                    res.json(data);
                }
            } else {
                res.json({ error: "No data returned from the API" });
            }
            
        }
    })
});