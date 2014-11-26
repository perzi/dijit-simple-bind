define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on"

], function(
	array,
	declare,
	lang,
	on
) {
	function _bind(from, to, fromProperty, toProperty, oneWay) {

		var handle;
		var both = !oneWay;

		// TODO: bind multiple as an array
		// TODO: use this as default form

		// safety check
		if (typeof from !== "object" || !from) {
			throw("Must supply option 'from'");
		}
		if (typeof to !== "object" || !to) {
			throw("Must supply option 'to'");
		}
		if (typeof fromProperty !== "string") {
			throw("Must supply option 'property'");
		}

		var isUpdating = false;
		var createUpdater = function(target, targetProperty) {
			return function(fromProperty, oldValue, newValue) {
				if (isUpdating) {
					return;
				}
				isUpdating = true;
				target.set(targetProperty, newValue);
				isUpdating = false;
			};
		};

		var fromHandle = from.watch(fromProperty, createUpdater(to, toProperty));
		var toHandle;

		if (both) {
			toHandle = to.watch(toProperty, createUpdater(from, fromProperty));
		}

		handle = {
			remove: function() {
				fromHandle.remove();
				if (toHandle) {
					toHandle.remove();
				}
				handle.remove = function() {};
				handle = null;
			}
		};

		return handle;
	}


	function bind(/*Stateful*/fromObject, /*Stateful*/toObject, /*Object|String*/properties, /*Boolean?*/oneWay) {
		// summary:
		//		Adds synchronization between properties of two Statefuls,
		//		either two way (default) or one way.
		//
		// returns:
		//		handle
		//
		// example:
		// | bind(main, child, {
		// |     "title": "mainTitle",
		// | 	   "description": "description"
		// | }, false);
		// |
		// | bind(main, child, ["title", "description"], true);

		var property;
		var handles = [];
		var handle = {
			remove: function() {
				array.forEach(handles, function(h) {
					h.remove();
				});
				handle.remove = function() {};
				handle = null;
			}
		};

		if (lang.isArray(properties)) {
			handles = array.map(properties, function(prop) {
				return _bind(fromObject, toObject, String(prop), String(prop), oneWay);
			});
		} else {
			for (property in properties) {
				if (properties.hasOwnProperty(property)) {
					handles.push(_bind(fromObject, toObject, property, String(properties[property]), oneWay));
				}
			}
		}

		return handle;
	}

	return bind;
});
