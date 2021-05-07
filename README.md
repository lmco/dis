<<<<<<< HEAD
# dis
Dynamic Integration Service
=======
# Dynamic Integration Service

This node.js application dynamically adds integrated services to MCF.

## Prerequisites

#### Node.js
The first dependency to get started is Node.js and NPM. NPM comes with
Node.js; just install packages with NPM to get started. To start up the Dynamic Integration Service,
node version 12.18.3 or greater is required.
See [nodejs.org](https://nodejs.org/en/) for information on Node.js.

#### Redis
The second dependency is Redis. Redis is used for storing service configurations and updating
MCF sessions with authentication tokens.

#### Source Code

1. Clone the Dynamic Integration Service by running `git clone https://github.com/open-mbee/dis.git`.
2. Navigate to the directory with `cd dis`

## Getting Started

1. Install dependencies by running `yarn install` or `npm install`.
2. Run the Dynamic Integration Service by running `yarn start` or `npm start`.

## Adding New Services

1. In the `services-config.js file`, add a new object block for your service.
    Example

    ```javascript
    {
        name: 'NAME_OF_SERVICE',
        protocol: 'http/https',
        url: 'HOSTNAME_OF_SERVICE:PORT_OF_SERVICE'
    }
    ```

2. In the services folder, create a .js file the same name as the service name. This file should export a class and must have the method `handleAuth` implemented. The following parameters will be passed:

    ```javascript
     @param {Object} message the object containing the properties below.
     @param {String} message.sessionId the session ID for the user.
     @param {String} message.user the users username.
     @param {String} message.token the users MCF token.
     @param {Boolean} message.exists true/false if users integration key exists. in MCF
    ```

3. Add auth token to user session. Example below.

    ```javascript
    // Get the users session
    let session = await this.publisher.get(`sess:${message.sessionId}`);
    session = JSON.parse(session);

    // Store token in users session
    session['SERVICENAME_token'] = 'AUTH_TOKEN';
    this.publisher.set(`sess:${message.sessionId}`, JSON.stringify(session));
    ```

4. Next, in the `index.js` file, import the class and add a property to the `serviceClasses` object creating a new instance to the service class you created. Make sure the property is the same name as the service.

5. Create a `.env` file in the root directory and copy the contents from the `example.env` file. Update the following Environment Variables.

    ```bash
    # this should be false in production
    HTTP_ENABLED=true
    # this should be true in production
    HTTPS_ENABLED=false
    # port you want the dynamic service to run on
    PORT=8000
    # path to the key file. this is required in production.
    SSL_KEY=
    # path to the cert file. this is required in production.
    SSL_CERT=
    # URL to MCF
    MCF_URL=http://127.0.0.1:9080
    # redis host url or alias
    REDIS_HOST=127.0.0.1
    # redis port
    REDIS_PORT=6379
    # redis database
    REDIS_DB=0
    # encryption secret/pasphrase. this should be replaced using a cryptographically secure method like `openssl rand -base64 16`
    ENCRYPTION_SECRET=a_really_big_secret
    ```

Feel free to add specific configuration for new services.

That's it!
>>>>>>> public
