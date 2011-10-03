module.exports = Class(UIComponent, function() {
	
	this.renderContent = function() {
		this.append(
			this._head = DIV(),
			this._body = DIV(),
			this._foot = DIV()
		)
		this.renderHead()
		this.renderBody()
		this.renderFoot()
	}
	
	this.renderHead = function() {}
	this.renderBody = function() {}
	this.renderFoot = function() {}
	
})