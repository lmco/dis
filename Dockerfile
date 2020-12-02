FROM registry.access.redhat.com/ubi7/ubi
WORKDIR /opt/dynamic-integration-service

ENV HTTP_PROXY="http://proxy-lmi.global.lmco.com:80" \
    HTTPS_PROXY="http://proxy-lmi.global.lmco.com:80" \
    http_proxy="http://proxy-lmi.global.lmco.com:80" \
    https_proxy="http://proxy-lmi.global.lmco.com:80" \
    NO_PROXY=127.0.0.1,localhost \
    NODE_ENV=production \
    CAFILE_DST="/opt/dynamic-integration-service/certs/LockheedMartinCertificateAuthority.pem" \
    NODE_EXTRA_CA_CERTS="/opt/dynamic-integration-service/certs/LockheedMartinCertificateAuthority.pem"

# Copy Project
COPY . ./

# Update proxy and install auxiliary packages
RUN echo proxy=$http_proxy >> /etc/yum.conf \
    && echo sslverify=false >> /etc/yum.conf

# Install wget and git
RUN yum install -y wget git

# Install NodeJS 12
RUN wget https://nodejs.org/dist/v12.18.4/node-v12.18.4-linux-x64.tar.gz --no-check-certificate \
    && tar --strip-components 1 -xzvf node-v* -C /usr/local

# Set npm proxy settings and perform global yarn install
RUN npm set cafile $CAFILE_DST \
    && npm config set http_proxy $http_proxy \
    && npm config set https_proxy $https_proxy \
    && npm install -g yarn

# Create mbee user and run DIS under that context
RUN groupadd -r mbee -g 1000 \
     && useradd -u 1000 -r -g mbee -m -d /opt/dynamic-integration-service -s /sbin/nologin -c "MBEE user" mbee \
     && chmod 755 /opt/dynamic-integration-service \
     && chown -R mbee:mbee /opt/dynamic-integration-service

USER mbee

# Set yarn proxy settings
RUN yarn config set cafile $CAFILE_DST \
    && yarn config set http_proxy $http_proxy \
    && yarn config set https_proxy $https_proxy

RUN yarn install --production

ENV HTTP_PROXY="" \
    HTTPS_PROXY="" \
    http_proxy="" \
    https_proxy=""

EXPOSE 8000

# Run server
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["node index.js"]
