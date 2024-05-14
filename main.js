const express = require('express');
const session = require('express-session');
const querystring = require('querystring');
const request = require('request');

const app = express();
const port = 5000;

const CLIENT_ID = 'ac741c3507aa4edc81755b589eef91e4';
const CLIENT_SECRET = 'a27b89cc9ecc476ba75a6d939f0f115c';
const REDIRECT_URI = 'http://localhost:' + port + '/callback';

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
            //client_id: CLIENT_ID,
            //client_secret: CLIENT_SECRET,
        };

        const reqHeader = {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        }

        request.post({ url: TOKEN_URL, form: reqBody, headers: reqHeader }, (error, response, body) => {
            const tokenInfo = JSON.parse(body);
            console.log("Token info: ", tokenInfo);
            session.access_token = tokenInfo.access_token;
            session.refresh_token = tokenInfo.refresh_token;

            const tokenExpiresInSeconds = tokenInfo.expires_in;
            const currentTimeMilliseconds = new Date().getTime();
            const expirationTimeMilliseconds = currentTimeMilliseconds + (tokenExpiresInSeconds * 1000);
            
            session.expires_at = expirationTimeMilliseconds;
            res.redirect('/logged');
        });

        /*var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
              code: req.query.code,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code'
            },
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              Authorization: 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
            },
            json: true
          };
      
        request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
    
            var access_token = body.access_token,
                refresh_token = body.refresh_token;
    
            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };
    
            // use the access token to access the Spotify Web API
            request.get(options, function(error, response, body) {
                console.log(body);
            });
    
            // we can also pass the token to the browser to make requests from there
            res.redirect('/#' +
            querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
            }));
        } else {
            res.redirect('/#' +
            querystring.stringify({
                error: 'invalid_token'
            }));
        }
        });*/
    }
});

app.get('/logged', (req, res) => {
    res.sendFile(__dirname + "/views/logged.html");
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

app.get('/getSongs', (req, res) => {
    var type = "artists";
    var apiUrl = API_BASE_URL + "me/top/" + type;

    request.get({
        url: apiUrl,
        headers: {
            'Authorization': 'Bearer ' + session.access_token
        }
    }, (error, response, body) => {
        if (error) {
            res.json({ error });
        } else {
            res.json(JSON.parse(body));
        }
    })
});

