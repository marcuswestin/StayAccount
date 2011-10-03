Class = require('std/Class')
bind = require('std/bind')
each = require('std/each')
map = require('std/map')
NODES = require('dom/NODES').exposeGlobals()
UIComponent = require('dom/Component')
NODES.NODE.prototype.renderContent = function() { this._processArgs(this._args, 0) } // Disable classname-as-first-arg
