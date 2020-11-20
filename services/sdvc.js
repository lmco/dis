'use strict';

const axios = require('axios');
const generator = require('generate-password');
const utils = require('../lib/utils');
const logger = require('../lib/logger');

class SdvcService {
    constructor(publisher) {
        this.serviceName = 'sdvc';
        this.publisher = publisher;
    }

    /**
     * Handle the authentication for the SDVC Service
     * @param {Object} message the object containing the properties below.
     * @param {String} message.sessionId the session ID for the user
     * @param {String} message.user the users SDVC username
     * @param {String} message.token the users MCF token
     * @param {Boolean} message.exists true/false if user exists in SDVC
     */
    async handleAuth(message) {
        logger.info('Handling Auth for SDVC');
        try {
            message = JSON.parse(message);

            if (!message.exists) {
                // Create an sdvc user with generated password
                const sdvcGeneratedPassword = generator.generate({
                    length: 12,
                    numbers: true,
                    strict: true
                });

                // creating user
                const newUser = await axios({
                    method: 'post',
                    url: `${process.env.MCF_URL}/plugins/mms3-adapter/alfresco/service/sdvc-user/${message.user}`,
                    headers: { Authorization: `Bearer ${message.token}` },
                    data: {
                        password: sdvcGeneratedPassword
                    }
                });

                // encrypt user password
                const authIntegrationKey = JSON.stringify({
                    user: message.user,
                    name: 'sdvc',
                    key: utils.encryptKey(sdvcGeneratedPassword)
                });

                message.key = authIntegrationKey.key;

                // Send message on channel NEW_AUTH_INTEGRATION_KEY with name and key
                this.publisher.publish('NEW_AUTH_INTEGRATION_KEY', authIntegrationKey);
            }

            // Log in user to SDVC and update session with token
            // Decrypt key first
            const decryptedKey = utils.decryptKey(message.key);
            // Get auth token for SDVC
            const token = await axios({
                method: 'post',
                url: `${process.env.MCF_URL}/plugins/mms3-adapter/alfresco/service/sdvc-token/${message.user}`,
                headers: { Authorization: `Bearer ${message.token}` },
                data: {
                    password: decryptedKey
                }
            });

            // Get the users session
            let session = await this.publisher.get(`sess:${message.sessionId}`);
            session = JSON.parse(session);

            // Store token in users session
            session[`${this.serviceName}_token`] = token.data.token.token;
            this.publisher.set(`sess:${message.sessionId}`, JSON.stringify(session));
            logger.info(`Auth token for SDVC successfully stored in user (${message.user}) session`)
        }
        catch (err) {
            logger.error(err);
        }
        
    }
}

module.exports = SdvcService;