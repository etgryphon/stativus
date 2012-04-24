MIN_NAME=stativus-min.js
EVENTED_NAME=stativus-evt-min.js

all: minified evented 

minified: stativus.js
	@@rm -f ./libs/$(MIN_NAME)
	@@uglifyjs --define DEBUG_MODE=false --define EVENTABLE=false ./stativus.js > ./libs/$(MIN_NAME)
	@@echo 'Basic Minified version built'

evented: stativus.js
	@@rm -f ./libs/$(EVENTED_NAME)
	@@uglifyjs --define DEBUG_MODE=false --define EVENTABLE=true ./stativus.js > ./libs/$(EVENTED_NAME)
	@@echo 'Minified Evented version built'
	