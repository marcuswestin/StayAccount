require('./globals')

var CurrentActivitiesView = require('./views/CurrentActivitiesView')

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

function displayUI() {
	var currentActivitiesView = new CurrentActivitiesView().appendTo(BT.body)
}