FROM registry.access.redhat.com/ubi7/ubi
WORKDIR /opt/dynamic-integration-service

# Create dis user and run dis under that context
RUN groupadd -r dis -g 1020 \
    && useradd -u 1020 -r -g dis -m -d /opt/dynamic-integration-service -s /sbin/nologin -c "DIS user" dis

ENV NODE_ENV=production

# Install wget and git
RUN yum install -y wget

# Install NodeJS 12
RUN wget https://nodejs.org/dist/v12.18.4/node-v12.18.4-linux-x64.tar.gz --no-check-certificate \
    && tar --strip-components 1 -xzvf node-v* -C /usr/local

# Install yarn
RUN npm install -g yarn

# Copy Project
COPY . ./

RUN yarn install --production

USER dis

EXPOSE 8000

# Run server
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["node index.js"]
