HTML_NAME=index.html

all: 
	@@echo 'Building the index.html file...'
	@@jade -p ./templates/index.jade -P < templates/index.jade > index.html
	@@echo 'Building the quick-start.html file...'
	@@jade -P < templates/quick-start.jade > quick-start.html
