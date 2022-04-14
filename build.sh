#!/bin/sh
quasar build && cp -r plugin/* dist/spa/ && echo Done.
