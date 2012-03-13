MIN_NAME=stativus-min.js

minified : stativus.js
	@@rm -f ./libs/$(MIN_NAME)
	@@uglifyjs --define DEBUG_MODE=false ./stativus.js > ./libs/$(MIN_NAME)
	@@echo 'Minified version built'