FROM jfrog.swf.mbx.us.lmco.com/mbx-docker/base-node:12

# Create dis user and run dis under that context
RUN groupadd -r dis -g 1020 \
    && useradd -u 1020 -r -g dis -m -d /opt/dynamic-integration-service -s /sbin/nologin -c "DIS user" dis

WORKDIR /opt/dynamic-integration-service

ENV NODE_ENV=production \
    CAFILE_DST="/opt/dynamic-integration-service/certs/LockheedMartinCertificateAuthority.pem"

# Copy Project
COPY . ./

USER dis

RUN yarn install --production

ENV HTTP_PROXY="" \
    HTTPS_PROXY="" \
    http_proxy="" \
    https_proxy=""

EXPOSE 8000

# Run server
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["node index.js"]
