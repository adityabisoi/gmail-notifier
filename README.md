# gmail-notifier
A script which sends notifications to your OS when you get a new mail

## Installation
* Go to [Gmail API](https://developers.google.com/gmail/api/quickstart/nodejs), create a new app, enable Gmail API and download `credentials.json` file
* Run `npm install` to generate a `token.json` file and fetch **Unread** messages from your mailbox.

## Add script as a service
The following steps is applicable only for Linux users. For MacOS and Windows users, multiple answers on the internet show the procedure as well.
* Install `pm2` which is a production process manager, with the command `npm install pm2 -g`
* Run `pm2 start index.js` to run `index.js` in background
* To start the script on startup, run `pm2 startup systemd`
* Run the output of the previous step, which should be in the format `sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <username> --hp /home/<username>`

**Note:** You can change the interval in which the app checks for new messages, which is defaulted to `15 minutes => 900000 miliseconds`
