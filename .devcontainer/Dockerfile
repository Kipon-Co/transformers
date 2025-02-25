FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

ENV ACCEPT_EULA=Y
ENV DEBIAN_FRONTEND=noninteractive
ENV NONINTERACTIVE=1

# Add Gum to source lists
RUN mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://repo.charm.sh/apt/gpg.key | gpg --dearmor -o /etc/apt/keyrings/charm.gpg \
  && echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" | tee /etc/apt/sources.list.d/charm.list

# Update system packages
RUN apt-get update -y && apt-get upgrade -y && apt-get autoremove -y

# install chrome
RUN curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_$(dpkg --print-architecture).deb -o /tmp/chrome.deb \
  && apt-get -y install /tmp/chrome.deb

# install lib dependencies
RUN apt-get install -y --no-install-recommends build-essential postgresql postgresql-contrib \
  # utils
  gum libpq-dev dnsutils inetutils-ping telnet cpu-checker
  # libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb \

USER vscode

# install homebrew and s1m (SSM Manager)
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
  echo >> /home/vscode/.zshrc && \
  echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/vscode/.zshrc && \
  eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && brew install yumafuu/tap/s1m

USER root
