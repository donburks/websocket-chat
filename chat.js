var chat = {
	connection: null,
	members: [],
	name: '',
	sendMessage: function() {
		var msg = $("#message").val();
		var payload = chat.payload('msg', msg);

		chat.sendMsg(payload);

		chat.clearMsg();
	},
	clearMsg: function() {
		$("#message").val('');
	},
	connect: function() {
		chat.connection = new WebSocket("ws://127.0.0.1:4000");
	},
	init: function() {
		chat.name = $("#name").val();
		
		if (chat.name == '') {
			return false;
		}

		chat.members.push(chat.name);

		chat.showChatControls($(this));

		chat.connect();
		chat.listen();
	},
	listen: function() {
		if (chat.connection) {
			chat.connection.onopen = function(){
				chat.announcement('entered');
			};

			chat.connection.onclose = function() {
				chat.announcement('left');
			};

			chat.connection.onmessage = function(message) {
				var payload = JSON.parse(message.data);
				chat[payload.cmd](payload);
			};
		}
	},
	getNames: function() {
		var payload = chat.payload('names', '');
		chat.connection.send(JSON.stringify(payload));
	},
	names: function(payload) {
		$("#members").html(payload.value.join(', '));
	},
	msg: function(payload) {
		var st = $("<strong>").text(payload.sender);
		$("<p>").html(': ' + payload.value).prepend(st).appendTo("#chat");
		chat.getNames();
	},
	troll: function(payload) {
		if (chat.name !== payload.sender) {
			$("#chat").find('p').css('color', payload.value);
		}
	},
	system: function(payload) {
		$("<p>").html(payload.value).appendTo("#chat");
		chat.getNames();
	},
	announcement: function(action) {
		var payload = chat.payload('system', chat.name + ' has ' + action + ' the room!');
		chat.sendMsg(payload);
	},
	showChatControls: function(join) {
		var sendBtn = $("#send");
		join.off('click').hide();
		sendBtn.add("#members").add("#message").add("#troll").removeClass('hide');
		sendBtn.on('click', chat.sendMessage);
		$("#troll").on('click', chat.trollChat);
	},
	randColour: function() {
		var colours = ["green", "white", "magenta", "blue", "red", "purple", "pink", "cyan"];
		return colours[Math.floor(Math.random() * colours.length)];
	},
	trollChat: function() {
		var payload = chat.payload('troll', chat.randColour());
		chat.sendMsg(payload);

		chat.announcement('trolled');
	},
	payload: function(cmd, param) {
		return {cmd: cmd, value: param, sender: chat.name};
	},
	sendMsg: function(payload) {
		chat.connection.send(JSON.stringify(payload));
	}
};

$(function() { 
	$('#join').on('click', chat.init);
}); 

