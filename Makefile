MIN_NAME=stativus-min.js
FULL_NAME=stativus-full.js

all: full minified

full: stativus.js
	@@rm -f ./libs/$(FULL_NAME)
	@@preprocess ./stativus.js -DEBUG=false > ./libs/$(FULL_NAME)
	@@echo 'Uncompressed production version built'

minified: full
	@@rm -f ./libs/$(MIN_NAME)
	@@uglifyjs ./libs/$(FULL_NAME) --comments -m -o ./libs/$(MIN_NAME) --source-map ./build_log/$(MIN_NAME).map
	@@echo 'Basic Minified version built'
