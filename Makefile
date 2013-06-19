MIN_NAME=stativus-min.js
EVENTED_NAME=stativus-evt-min.js
FULL_NAME=stativus-full.js
EVTN_FULL_NAME=stativus-evt-full.js

all: full efull minified evented
	
full: stativus.js
	@@rm -f ./libs/$(FULL_NAME)
	@@preprocess ./stativus.js -DEBUG=false -EVENTABLE=false > ./libs/$(FULL_NAME)
	@@echo 'Uncompressed production version built'

efull: stativus.js
	@@rm -f ./libs/$(EVTN_FULL_NAME)
	@@preprocess ./stativus.js -DEBUG=false -EVENTABLE=true > ./libs/$(EVTN_FULL_NAME)
	@@echo 'Uncompressed production eventable version built'

minified: full
	@@rm -f ./libs/$(MIN_NAME)
	@@uglifyjs ./libs/$(FULL_NAME) > ./libs/$(MIN_NAME)
	@@echo 'Basic Minified version built'

evented: efull
	@@rm -f ./libs/$(EVENTED_NAME)
	@@uglifyjs ./libs/$(EVTN_FULL_NAME) > ./libs/$(EVENTED_NAME)
	@@echo 'Minified Evented version built'
