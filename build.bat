@echo off
quasar build && powershell -Command "Copy-Item -Recurse -Force plugin/* dist/spa/" && echo Done.
