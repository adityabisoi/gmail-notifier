const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');
const notifier = require('node-notifier');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), fetchUnread);
});

function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function fetchUnread(auth){
    setInterval(function() {
        fetchEmail(auth)
    }, 10000);      // 15min : 900000 ms
}

function fetchEmail(auth) {
    const gmail = google.gmail({
        version: 'v1',
        auth
    });
    gmail.users.messages.list({
        userId: 'me',
        q: "is:unread category:primary"
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const {
            messages,
            resultSizeEstimate
        } = res.data
        if (resultSizeEstimate) {
            messages.forEach((msg) => {
                fetchEmail(msg.id)
            })
        }
    });

    function fetchEmail(id) {
        gmail.users.messages.get({
            userId: 'me',
            id: id
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const {
                snippet,
                payload
            } = res.data
            payload.headers.forEach((header) => {
                if (header.name === 'From') {
                    notify(header.value,snippet)
                }
            })
        })
    }

    function notify(title,body) {
        notifier.notify({
            title: title,
            message: body,
            icon: path.join(__dirname, 'logo-gmail.png'),
            sound: true
          }
        );
        
    }

}