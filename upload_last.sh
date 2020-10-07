#!/usr/bin/env bash

cat lastlog | curl -s -F 'f:1=<-' ix.io
