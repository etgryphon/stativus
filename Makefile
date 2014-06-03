.PHONY: clean compile

all: compile

clean:
	@@echo 'Removing existing html pages'
	@@rm -f index.html

	@@echo 'Removing app.css'
	@@rm -f ./assets/app.css

	@@echo 'Removing app.js'
	@@rm -f ./assets/app.js

compile: clean
	@@echo 'Installing required node.js packages'
	@@npm install

	@@echo 'Building app.css'
	@@./node_modules/.bin/stylus --compress --include-css --include ./src/styl < ./src/styl/app.styl > ./assets/app.css

	@@echo 'Building app.js'
	@@node Make_app_js.js

	@@echo 'Building index.html [index.jade > index.html]'
	@@./node_modules/.bin/jade -p ./src/templates/index.jade -P < src/templates/index.jade > index.html

test: compile
	python -m SimpleHTTPServer