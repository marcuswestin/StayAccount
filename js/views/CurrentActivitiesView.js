var View = require('./View'),
	time = require('std/time')

// function bindNodeToQuery(node, query, renderFn) {
// 	return function() {
// 		node.text('Loading...')
// 		BT.sql.query(query, function(err, res) {
// 			if (err) { return node.text('Error: ' + err) }
// 			node.empty().append(map(res, renderFn))
// 		})
// 	}
// }

module.exports = Class(View, function() {
	
	var headHeight = 40
	this._activitiesTable = 'current_activities'
	
	this.renderHead = function() {
		this._head.style({ width:'100%', height:headHeight, position:'fixed', top:0, left:0, background:'#abf', textAlign:'center', boxShadow:'#333 0px 1px 2px' }).append(
			DIV('current activities').style({ textShadow:'#fff 0 1px 0', fontSize:22, marginTop:3 }),
			DIV('+', { touchstart:bind(this, this._startNewActivity) }).style({ position:'absolute', top:8, left:8, width:20, height:20, border:'1px outset #fff', borderRadius:4 }),
			DIV('I', { touchstart:bind(this, this._setView, 'completed_intervals') }).style({ position:'absolute', top:8, right:20, width:20, height:20, border:'1px outset #fff', borderRadius:4 }),
			DIV('A', { touchstart:bind(this, this._setView, 'current_activities') }).style({ position:'absolute', top:8, right:45, width:20, height:20, border:'1px outset #fff', borderRadius:4 })
		)
	}
	
	this.renderBody = function() {
		this._body.style({ width:305, margin:headHeight+'px auto', background:'#fff', height:'100%', boxShadow:'#fff 0 0 20px' }).append(
			this._currentActivities = DIV()
		)
		this._refreshCurrentActivities()
	}
	
	this.renderFoot = function() {
		
	}
	
	this._setView = function(table) {
		this._activitiesTable = table
		this._refreshCurrentActivities()
	}
	
	this._refreshCurrentActivities = function() {
		BT.sql.query('SELECT ca.id ca_id, ca.start_time ca_start_time, at.name at_name, at.id at_id FROM '+this._activitiesTable+' ca INNER JOIN activity_types at ON ca.activity_type_id = at.id', bind(this, function(err, res) {
			if (err) { return this._currentActivities.text("Error: " + err) }
			this._currentActivities.empty().append(map(res.results, this, function(result) {
				var dateNode = DIV().style({ fontSize:16, color:'#555' }),
					nameNode = DIV(result.at_name).style({ textShadow:'#ccc 0 2px 0' }),
					doneButton = DIV('Done', { click:bind(this, this._markCurrentActivityDone, result.ca_id, result.ca_start_time, result.at_id) }).style({ 'float':'right', fontSize:12, border:'1px outset #ccc', borderRadius:5, padding:'1px 5px', margin:'2px 0' }),
					node = DIV(doneButton, nameNode, dateNode).style({ fontSize:20, padding:5, borderBottom:'1px solid #555' })
				setTimeout(function() {
					time.ago(result.ca_start_time, function(timeAgo) {
						dateNode.text('started ' + timeAgo)
					})
				})
				return node
			}))
		}))
	}
	
	this._startNewActivity = function() {
		if (!this._activityMenuEl) { this._activityMenuEl = DIV().style({ width:300, background:'red' }) }
		this._activityMenuEl.appendTo(this._head)
		BT.sql.query('SELECT * FROM activity_types', bind(this, function(err, res) {
			if (err) { return this._activityMenuEl.text('Error: ' + err) }
			this._activityMenuEl.append(map(res.results, this, function(result) {
				return DIV(result.name, { touchstart:bind(this, this._addCurrentActivityWithType, result.id)})
			}))
		}))
	}
	
	this._addCurrentActivityWithType = function(activityTypeID) {
		this._activityMenuEl.remove()
		BT.sql.update('INSERT INTO current_activities (activity_type_id, start_time) VALUES ('+activityTypeID+','+new Date().getTime()+')', bind(this, function(err, res) {
			if (err) { return alert("Could not create activity: " + err) }
			this._refreshCurrentActivities()
		}))
	}
	
	this._markCurrentActivityDone = function(currentActivityID, startTime, activityTypeID) {
		var duration = new Date().getTime() - startTime
		var updates = [
			'INSERT INTO completed_intervals (activity_type_id, start_time, duration) VALUES ('+activityTypeID+', '+startTime+', '+duration+')',
			'DELETE FROM current_activities WHERE id=' + currentActivityID
		]
		BT.sql.update(updates.join(';'), bind(this, function(err, res) {
			if (err) { return alert("Could not complete activity: " + err) }
			this._refreshCurrentActivities()
		}))
	}
})