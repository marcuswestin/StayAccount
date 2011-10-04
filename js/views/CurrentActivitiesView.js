var View = require('./View'),
	time = require('std/time'),
	extend = require('std/extend'),
	round = require('std/math/round')

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
	this._activitiesTable = 'completed_intervals'
	
	/* Sections
	 **********/
	this.renderHead = function() {
		this._head.style({ width:'100%', height:headHeight, position:'fixed', top:0, left:0, background:'#abf', textAlign:'center', boxShadow:'#333 0px 1px 2px' }).append(
			this._titleNode = DIV('current activities').style({ textShadow:'#fff 0 1px 0', fontSize:22, marginTop:3 }),
			DIV('+', { click:bind(this, this._startNewActivity) }).style({ position:'absolute', top:8, left:8, width:30, height:20, border:'1px outset #fff', borderRadius:4 }),
			DIV('>>', { touchstart:bind(this, this._nextView) }).style({ position:'absolute', top:8, right:8, width:35, height:20, border:'1px outset #fff', borderRadius:4 })
		)
	}
	
	this.renderBody = function() {
		this._body.style({ width:305, margin:headHeight+'px auto', background:'#fff', height:'100%', boxShadow:'#fff 0 0 20px' }).append(
			this._activitiesEl = DIV()
		)
		this._nextView()
	}
	
	this._nextView = function() {
		this._activitiesTable = (this._activitiesTable == 'current_activities' ? 'completed_intervals' : 'current_activities')
		this._titleNode.text(this._activitiesTable == 'current_activities' ? 'current activities' : 'completed activities')
		this._refreshCurrentActivities()
	}

	/* Querying data and displaying views
	 ************************************/
	this._refreshCurrentActivities = function() {
		var table = this._activitiesTable,
			selections = ['ca.id', 'ca.start_time', 'at.name', 'at.id']
		if (table == 'completed_intervals') { selections.push('ca.duration') }
		var selectionsSql = map(selections, function(selection) { return selection + ' ' + selection.replace('.', '_') }) // ca.start_time becomes ca_start_time
		BT.sql.query('SELECT '+selectionsSql.join(', ')+' FROM '+table+' ca INNER JOIN activity_types at ON ca.activity_type_id = at.id', bind(this, function(err, res) {
			if (err) { return this._activitiesEl.text("Error: " + err) }
			this._activitiesEl.empty().append(map(res.results, this, table == 'completed_intervals' ? this._renderCompletedActivity : this._renderCurrentActivity))
		}))
	}
	
	this._startNewActivity = function() {
		this._activityMenuEl = DIV()
			.style({ position:'absolute', top:headHeight-30, left:8, width:280, height:420, overflowY:'auto', border:'10px solid #88aaee', borderRadius:6, background:'#fff', textAlign:'left' })
			.appendTo(this._head)
		
		BT.sql.query('SELECT * FROM activity_types', bind(this, function(err, res) {
			if (err) { return this._activityMenuEl.text('Error: ' + err) }
			var itemStyle = { padding:'5px 8px', fontSize:18 }
			this._activityMenuEl.append(DIV('New activity...', { style:itemStyle, click: bind(this, function() {
				var activityName = prompt('Activity name')
				BT.sql.update('INSERT INTO activity_types (name) VALUES ("'+activityName+'")', bind(this, function(err, res) {
					if (err) { return alert('Could not create new activity: ' + err) }
					BT.sql.query('SELECT last_insert_rowid()', bind(this, function(err, res) {
						this._addCurrentActivityWithTypeID(res.results[0]['last_insert_rowid()'])
					}))
				}))
			})}))
			this._activityMenuEl.append(map(res.results, this, function(result) {
				return DIV(result.name, { click:bind(this, this._addCurrentActivityWithTypeID, result.id)}).style(itemStyle)
			}))
		}))
	}
	
	this._addCurrentActivityWithTypeID = function(activityTypeID) {
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
	
	/* Rendering data
	 ****************/
	var rowStyle = { fontSize:20, padding:5, borderBottom:'1px solid #555' },
		completedRowStyle = extend(rowStyle, { borderBottomColor:'#888' }),
		titleStyle = { textShadow:'#ccc 0 2px 0' },
		timeStyle = { fontSize:16, color:'#555' },
		doneButtonStyle = { 'float':'right', fontSize:12, border:'1px outset #ccc', borderRadius:5, padding:'1px 5px', margin:'2px 0' }

	this._renderCurrentActivity = function(data) {
		return DIV({ style:rowStyle },
			DIV('Done', { click:bind(this, this._markCurrentActivityDone, data.ca_id, data.ca_start_time, data.at_id) }).style(doneButtonStyle),
			DIV(data.at_name).style(titleStyle),
			DIV({ style:timeStyle },
				'started ', timeAgoNode(data.ca_start_time)
			)
		)
	}

	this._renderCompletedActivity = function(data) {
		return DIV({ style:completedRowStyle },
			DIV(data.at_name).style(titleStyle),
			DIV({ style:timeStyle },
				DIV('lasted '+durationString(data.ca_duration)),
				DIV('started ', timeAgoNode(data.ca_start_time))
			)
		)
	}

	function timeAgoNode(startTime) {
		var node = SPAN()
		time.ago(startTime, function(timeAgo) { node.text(timeAgo) })
		return node
	}

	function durationString(duration) {
		if (duration < time.minute) { return 'less than a minute' }
		if (duration < time.hour) { return Math.floor(duration / time.minute) + ' minutes' }
		if (duration < time.day) { return Math.floor(duration / time.hour) + ' hours & ' + Math.floor((duration % time.hour) / time.minute) + ' minutes' }
		return Math.floor(duration / time.day) + ' days & ' + Math.floor((duration % time.day) / time.hour) + ' hours'
	}
})