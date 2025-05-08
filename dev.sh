#!/bin/sh
git pull
cd plugin && npm i && cd .. && npm i
quasar dev
