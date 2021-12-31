Code Repository for {Insert Link to Twilio Blog Post}

**Project Overview**:
This is the back end code accompanying the following blog post: {Link}

This repository can be used to build your own API that can templatize and deploy a custom IVR using Twilio Studio. Learn more about Twilio Studio here:

## Prerequisite
Node.js is required in order to launch the server. Refer to [this guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install Node.js

Once Node.js is installed, open terminal and navigate to the source folder. Then execute the following:
```
npm install
```

## Configuration

In order to host the Twilio Small Business Platform, you will need:
* A Twilio Account

Once you have these 2 accounts, rename the ".env.example" file to ".env".

Open the new .env file and edit the following values:
```
PORT=3080
ACCOUNT_SID = {ENTER TWILIO ACCOUNT_SID HERE}
AUTH_TOKEN = {ENTER TWILIO AUTH_TOKEN HERE}
```

One complete, you are ready to get started.

## Booting Server
While on the source folder, run following command on terminal
```
npm start
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
