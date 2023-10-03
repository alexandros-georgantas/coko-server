#!/bin/sh
set -x
export NODE_CONFIG_DIR='./dev/config'

# This is run through docker. Its CWD will be the root folder.
node_modules/.bin/pubsweet migrate
node ./dev/scripts/seedGlobalTeams.js
node ./dev/scripts/ensureTempFolderExists.js

exec "$@"
