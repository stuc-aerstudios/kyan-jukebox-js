FROM debian:buster-slim

RUN set -ex \
    # Official Mopidy install for Debian/Ubuntu along with some extensions
    # (see https://docs.mopidy.com/en/latest/installation/debian/ )
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y curl wget dumb-init gcc gnupg gstreamer1.0-alsa gstreamer1.0-plugins-bad python-crypto python-pykka \
 && mkdir -p /etc/apt/keyrings \
 && wget -q -O /etc/apt/keyrings/mopidy-archive-keyring.gpg https://apt.mopidy.com/mopidy.gpg \
 && wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/bullseye.list \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y mopidy mopidy-spotify \
 && apt-get purge --auto-remove -y curl wget gcc \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* ~/.cache

RUN  mkdir -p /root/.config \
 && ln -s /config /root/.config/mopidy

# Start helper script.
COPY ./entrypoint.sh /entrypoint.sh

# Default configuration.
COPY ./config/mopidy.conf /config/mopidy.conf

# Copy the pulse-client configuration.
COPY ./config/pulse-client.conf /etc/pulse/client.conf

EXPOSE 6600 6680 5555/udp

ENTRYPOINT ["/usr/bin/dumb-init", "/entrypoint.sh"]
CMD ["/usr/bin/mopidy"]


