const express = require('express');
const session = require('express-session');
const querystring = require('querystring');
const request = require('request');
const app = express();
const port = 5000;

const CLIENT_ID = 'ac741c3507aa4edc81755b589eef91e4';
const CLIENT_SECRET = 'a27b89cc9ecc476ba75a6d939f0f115c';
const REDIRECT_URI = 'http://localhost:5000/callback';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE_URL = 'https://api.spotify.com/v1/';


app.use(session({
    secret: CLIENT_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) =>{
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

            const tokenExpiresInSeconds = tokenInfo.expires_in;
            const currentTimeMilliseconds = new Date().getTime();
            const expirationTimeMilliseconds = currentTimeMilliseconds + (tokenExpiresInSeconds * 1000);
            
            req.session.expires_at = expirationTimeMilliseconds;
            res.redirect('/logged');
        });
    }
});

app.get('/logged', (req, res) => {
    res.sendFile(__dirname + "/views/logged.html")
})

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});