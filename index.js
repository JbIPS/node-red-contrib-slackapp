const Http = require('http');
const { WebClient } = require('@slack/web-api');
// // Initialize
const web = new WebClient();

module.exports = function(RED) {
	function SlackWebNode(config) {
		RED.nodes.createNode(this,config);
		this.on('input', async msg => {
			if(!msg.payload.token) return this.error('You must provide a valid token');
			try{
				const users = await web.users.list({token: 'xoxb-567903179857-642532954099-phQkialIJkImYPPMPKA8fMuC'});
				const {id: user} = users.members.find(user => user.name === 'jb');
				const im = await web.im.open({
					token: msg.payload.token,
					user
				});
				msg.payload.channel = im.channel.id;
				msg.payload = await web.chat.postMessage(msg.payload);
			} catch(e) {
				this.error(e.data, msg);
			}
			this.send(msg);
		});
	}
	RED.nodes.registerType("slack-web", SlackWebNode);

	function SlackInteractNode(config) {
		RED.nodes.createNode(this,config);
		RED.httpNode.post('/slack/interact', (req, res) => {
			const {body: {payload}} = req;
			const msg = {
				payload: JSON.parse(payload),
			}
			this.send(msg);
			return res.status(200).end();
		});
	}
	RED.nodes.registerType("slack-interact", SlackInteractNode);
}

