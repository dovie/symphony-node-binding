var certs = require('./cert');
var AuthModel = require('./AuthModel');
var MessageModel = require('./MessageModel');
var FeedModel = require('./FeedModel');
var UserModel = require('./UserModel');
var StreamModel = require('./StreamModel');

class Api {
	constructor (urls)
	{
		if (!urls) throw (new Error('missing urls'));
		if (!urls.keyUrl) throw (new Error('missing key store url (urls.keyUrl)'));
		if (!urls.sessionUrl) throw (new Error('missing session url (urls.sessionUrl)'));
		if (!urls.agentUrl) throw (new Error('missing agent url (urls.agentUrl)'));
		if (!urls.podUrl) throw (new Error('missing pod url (urls.podUrl)'));

		this.urls = urls;
        this.log = true;
	}

	setCerts (certPem, keyPem, passphrase)
	{
		var chain = certs.extractCerts(certPem);
		var cert = chain.pop();
		var sslOptions = {
			cert: cert,
			key: keyPem,
			passphrase: passphrase,
			requestCert: false,
			ca: chain,
		};

		this.sslOptions = sslOptions;
	}

	setSslOptions (sslOptions)
	{
		this.sslOptions = sslOptions
	}

	setLogState (on)
	{
		this.log = on;

		if (this.feed) this.feed.setLogState(this.log);
		if (this.message) this.message.setLogState(this.log);
		if (this.user) this.user.setLogState(this.log);
		if (this.stream) this.stream.setLogState(this.log);
	}

	authenticate ()
	{
		if (!this.sslOptions) throw(new Error('ssl options have not been configured, please call setCerts or setSllOptions'));

		var auth = new AuthModel(this.urls.sessionUrl, this.urls.keyUrl, this.sslOptions);
		auth.setLogState(this.log);

		return auth.authenticate()
			.then(function(headers)
			{
				this.headers = headers;
				this.feed = new FeedModel(this.urls.agentUrl, this.sslOptions, this.headers);
				this.message = new MessageModel(this.urls.agentUrl, this.sslOptions, this.headers);
				this.user = new UserModel(this.urls.podUrl, this.sslOptions, this.headers);
				this.stream = new StreamModel(this.urls.podUrl, this.sslOptions, this.headers);

/*
                this.feed = new FeedModel(this.urls.agentUrl, undefined, this.headers);
                this.message = new MessageModel(this.urls.agentUrl, undefined, this.headers);
                this.user = new UserModel(this.urls.podUrl, undefined, this.headers);
                this.stream = new StreamModel(this.urls.podUrl, undefined, this.headers);
*/

				this.feed.setLogState(this.log);
				this.message.setLogState(this.log);
				this.user.setLogState(this.log);
				this.stream.setLogState(this.log);

				return true;
			}.bind(this));
	}
}

module.exports = Api;
