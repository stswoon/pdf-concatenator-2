#!/bin/bash

echo "start.sh";
NGINX_PORT=${NGINX_PORT:-80}
echo NGINX_PORT=${NGINX_PORT}
sed -i "s/listen       80;/listen ${NGINX_PORT};/" /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"