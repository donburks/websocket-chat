var ws = require('ws').Server,
		server = new ws({port: 4000}),
		clients = [];
 
if (server) {
	console.log('server started');
}

function getNames() {
	var size = clients.length,
			list = [];

	while(size--) {
		list.push(clients[size].chatName);
	}

	return list;
}

server.on('connection', function(client) {
  clients.push(client);

  console.log('Got a new client!!!');
 
  client.on('message', function(message) {
		var payload = JSON.parse(message);

		if (!client.chatName) {
			console.log("Set chatName to " + payload.sender);
			client.chatName = payload.sender;
		}

		if (payload.cmd == 'names') {
			var list = getNames(),
					payload = {cmd: 'names', value: list, sender: ''};

			client.send(JSON.stringify(payload));
		} else {

			console.log('just received a message:', message);
	 
			for(var i = 0; i < clients.length; i++) {
				var c = clients[i];

				// clean out html
				message = message.replace('<', '&lt;').replace('>', '&gt;');
				if (c == undefined) {
					clients.splice(i, 1);
				} else {
					c.send(message);
				}
			}
    }
  });
 
	client.on('close', function() {
		 console.log('disconnected');
	});

  var payload = {cmd: 'system', value: 'Welcome to the chat room', sender: ''};
  client.send(JSON.stringify(payload));
});
