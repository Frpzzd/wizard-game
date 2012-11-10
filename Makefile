server:
	node server.js

build:
	browserify-server --bundle=client.js -o ./static/bundle.js

watch-build:
	wr -v -c 5 "make build" \
		client.js model.js static node_modules ui.js entities

live-reload:
	live-reload --delay=1000
