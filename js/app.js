module.exports = {
	startApp: startApp
}

function startApp() {
	BlowTorch.send('SQL', { 'query':'SELECT * FROM schema_versions' }, function(err, response) {
		if (err) { setupSchema() }
		else { displayUI() }
	})
}

function setupSchema() {
	BlowTorch.send('SQL', { getSchema:true }, function(err, response) {
		if (err) { return document.body.innerHTML = err }
		BlowTorch.send('SQL', { update:response.schema }, function(err, response) {
			if (err) { return alert("Could not create database" + err) }
			displayUI()
		})
	})
}

function displayUI() {
	var insertButton = BlowTorch.body.appendChild(document.createElement('div')),
		getButton = BlowTorch.body.appendChild(document.createElement('div')),
		output = BlowTorch.body.appendChild(document.createElement('div'))

	insertButton.innerHTML = 'insert'
	getButton.innerHTML = 'get'
	
	insertButton.ontouchstart = function() {
		BlowTorch.send('SQL', { update:'INSERT INTO activity_types (name) VALUES ("test'+new Date().getTime()+'")' }, function(err, response) {
			if (err) { return output.innerHTML = "Error inserting: " + err }
			getButton.ontouchstart()
		})
	}
	
	getButton.ontouchstart = function() {
		BlowTorch.send('SQL', { query:'SELECT * FROM activity_types'}, function(err, response) {
			output.innerHTML = JSON.stringify({ err:err, response:response })
		})
	}
	
	insertButton.ontouchstart()
	getButton.ontouchstart()
}