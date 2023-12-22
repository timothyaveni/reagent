#!/bin/bash

openssl ecparam -name secp521r1 -genkey -noout -out y-websocket-es512-private.pem
openssl ec -in y-websocket-es512-private.pem -pubout -out y-websocket-es512-public.pem

jq -n --arg key "$(awk '{printf "%s\n", $0}' y-websocket-es512-private.pem)" '{"JWT_PRIVATE_KEY": $key}' > y-websocket-es512-private.pem.json

cp y-websocket-es512-private.pem.json ../reagent-remix-vite/jwt/y-websocket-es512-private.pem.json
cp y-websocket-es512-public.pem ../y-websocket-server/jwt/y-websocket-es512-public.pem
