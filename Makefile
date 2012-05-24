HTML_NAME=index.html

all: 
	@@echo 'Building the index.html file...'
	@@jade -P < templates/index.jade > $(HTML_NAME)
