'use strict';

const axios = require('axios');
const generator = require('generate-password');
const utils = require('../lib/utils');
const logger = require('../lib/logger');

class MmsService {
    constructor(publisher) {
        this.serviceName = 'mms';
        this.publisher = publisher;
    }

    /**
     * Handle the authentication for the MMS Service
     * @param {Object} message the object containing the properties below.
     * @param {String} message.sessionId the session ID for the user
     * @param {String} message.user the users MMS username
     * @param {String} message.token the users MCF token
     * @param {Boolean} message.exists true/false if user exists in MMS
     */
    async handleAuth(message) {
        logger.info('Handling Auth for MMS');
        try {
            message = JSON.parse(message);

            // set headers
            const headers = {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${message.token}`
            };

            if (!message.exists) {
                // Create an mms user with generated password
                const mmsGeneratedPassword = generator.generate({
                    length: 12,
                    numbers: true,
                    strict: true
                });

                // creating user
                await axios({
                    method: 'post',
                    url: `${process.env.MCF_URL}/plugins/mms-adapter/alfresco/service/mms-user/${message.user}`,
                    headers: headers,
                    data: {
                        password: mmsGeneratedPassword
                    }
                });

                // encrypt user password
                const authIntegrationKey = {
                    user: message.user,
                    name: 'mms',
                    key: utils.encryptKey(mmsGeneratedPassword)
                };

                message.key = authIntegrationKey.key;

                // Send message on channel NEW_AUTH_INTEGRATION_KEY with name and key
                this.publisher.publish('NEW_AUTH_INTEGRATION_KEY', JSON.stringify(authIntegrationKey));
            }

            // Log in user to MMS and update session with token
            // Decrypt key first
            const decryptedKey = utils.decryptKey(message.key);

            // Get auth token response for MMS
            const response = await axios({
                method: 'post',
                url: `${process.env.MCF_URL}/plugins/mms-adapter/alfresco/service/mms-token/${message.user}`,
                headers: headers,
                data: {
                    password: decryptedKey
                }
            });

            // Get the users session
            let session = await this.publisher.get(`sess:${message.sessionId}`);
            session = JSON.parse(session);

            // Store token in users session
            session[`${this.serviceName}_token`] = response.data.token;
            this.publisher.set(`sess:${message.sessionId}`, JSON.stringify(session));
            logger.info(`Auth token for MMS successfully stored in user (${message.user}) session`);
        }
        catch (err) {
            logger.error(err);
        }
        
    }
}

module.exports = MmsService;