MIN_NAME=stativus-min.js
EVENTED_NAME=stativus-evt-min.js
FULL_NAME=stativus-full.js
EVTN_FULL_NAME=stativus-evt-full.js

all: minified evented full efull

minified: stativus.js
	@@rm -f ./libs/$(MIN_NAME)
	@@uglifyjs --define DEBUG_MODE=false --define EVENTABLE=false ./stativus.js > ./libs/$(MIN_NAME)
	@@echo 'Basic Minified version built'

evented: stativus.js
	@@rm -f ./libs/$(EVENTED_NAME)
	@@uglifyjs --define DEBUG_MODE=false --define EVENTABLE=true ./stativus.js > ./libs/$(EVENTED_NAME)
	@@echo 'Minified Evented version built'
	
full: stativus.js
	@@rm -f ./libs/$(FULL_NAME)
	@@preprocess ./stativus.js -DEBUG=false -EVENTABLE=false > ./libs/$(FULL_NAME)
	@@echo 'Uncompressed production version built'

efull: stativus.js
	@@rm -f ./libs/$(EVTN_FULL_NAME)
	@@preprocess ./stativus.js -DEBUG=false -EVENTABLE=true > ./libs/$(EVTN_FULL_NAME)
	@@echo 'Uncompressed production eventable version built'
