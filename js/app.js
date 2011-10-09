require('./globals')

var CurrentActivitiesView = require('./views/CurrentActivitiesView'),
	time = require('std/time')

module.exports = {
	startApp: startApp
}

document.body.style.fontFamily = 'futura'
document.body.style.color = '#333'

function startApp() {
	BT.sql.query('SELECT * FROM schema_versions', function(err, response) {
		if (err) { setupSchema() }
		else { displayUI() }
	})
}

function setupSchema() {
	BT.send('SQL', { getSchema:true }, function(err, response) {
		if (err) { return document.body.innerHTML = err }
		BT.sql.update(response.schema, function(err, response) {
			if (err) { return alert("Could not create database" + err) }
			displayUI()
		})
	})
}

var intervalID
function displayUI() {
	var currentActivitiesView = new CurrentActivitiesView().appendTo(BT.body)
	backupToCloud()
	if (!intervalID) { intervalID = setInterval(backupToCloud, 3 * time.hour) }
}

function backupToCloud() {
	BT.send('Backup', function(err, response) {
		BT.alert({ err:err, res:response })
	})
}
