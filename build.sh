#!/bin/bash

tsc
rm -rf build
rm -f mdcopy.zip
mkdir build
cp -r assets/ build
cp -r src/ build
rm build/src/*.ts
cp manifest.json LICENSE build
(cd build && zip -r ../mdcopy.zip .)


