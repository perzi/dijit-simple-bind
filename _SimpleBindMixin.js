define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/string",
	"dojo/query",
	"dijit/registry",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/NodeList-traverse"
], function(
	array,
	declare,
	lang,
	domAttr,
	domConstruct,
	string,
	query,
	registry,
	_WidgetsInTemplateMixin
) {
	// variable to use for namespacing properties before buildRendering
	var idCounter = 0;

	return declare(null, {

		// _simpleBindPropertyRegex: [private] RegEx
		//		Regular expression to match bindable properties
		_simpleBindPropertyRegex: /\{\{([^\}]+)\}\}/g,

		postMixInProperties: function() {
			this.inherited(arguments);

			if (this.isInstanceOf(_WidgetsInTemplateMixin)) {
				// increase id counter
				idCounter++;

				// convert names in template to namespaced names
				// {{property}} -> {{<idCounter>:property}}
				var nameSpacedDynamicProperty = string.substitute("{{${0}:$1}}", [idCounter]);
				var namespacedTemplateString = this.templateString.replace(this._simpleBindPropertyRegex, nameSpacedDynamicProperty);

				// update templateString
				this.templateString = namespacedTemplateString;

				// set regex to include the idCounter when finding created nodes
				this._simpleBindPropertyRegex = new RegExp("\\{\\{" + idCounter + ":([^\\}]+)\\}\\}", "g");
			}
		},

		buildRendering: function() {
			this.inherited(arguments);

			// check for attributes
			this._simpleBindAttributes(this.domNode);
			this._simpleBindText(this.domNode);
		},

		_simpleBindText: function(root) {

			var TEXT = 3;
			var node;
			var isMyContainerNode;
			var widget;

			for (var i = 0, l = root.childNodes.length; i < l; i++) {
				node = root.childNodes[i];

				if (node.nodeType === TEXT) {
					// find properties it text
					this._simpleBindTextNode(node);

				} else {
					isMyContainerNode = (this.containerNode === node);

 					if (!isMyContainerNode) {
						// check for both attributes
						this._simpleBindAttributes(node);
						this._simpleBindText(node);

					} else if (isMyContainerNode) {
						// check attributes in my containernode
						this._simpleBindAttributes(node);

					} else if (domAttr.has(node, "widgetid")) {
						// it's a child widget
						widget = registry.byNode(node);

						// only continue if the node has a containerNode
						if (widget.containerNode) {
							this._simpleBindText(node);
						}
					}
				}
			}
		},

		_simpleBindTextNode: function(node) {

			var reg = this._simpleBindPropertyRegex;
			var root = node.parentNode;
			var text = node.nodeValue;
			var matches = text.split(reg);
			var propertyMap = [];
			var createdIndex = 0;
			var baseIndex = 0;
			var n = node;

			// exit if we have no match
			if (matches.length <= 1) {
				return;
			}

			// find the index for this node in parent node
			while (n.previousSibling) {
				n = n.previousSibling;
				baseIndex++;
			}

			// TODO: put in single method
			var toCreateIndex = 0;
			var toCreate = [];

			array.forEach(matches, function(match, index) {

				// don't create empty content
				if (match.length === 0) {
					return;
				}

				if (index % 2 === 0) {
					// static content
					toCreate.push({
						static: match
					});
				} else {
					var options = match.split(/^!|:/g);
					var allowHTML = options[0] === "";
					var propertyName = options[allowHTML ? 1 : 0];
					var formatting = options[allowHTML ? 2 : 1];

					toCreate.push({
						property: propertyName,
						allowHTML: allowHTML,
						formatting: formatting,
						index: baseIndex + toCreateIndex,
						length: 1
					});
				}

				toCreateIndex++;
			}, this);

			// TODO: create single updater if node.parentNode.childNodes.length === 1
			// and toCreate is only one item

			// create static nodes and empty ones for the dynamic ones
			array.forEach(toCreate, function(def, index) {
				var newNode = document.createTextNode(def.static || "");
				root.insertBefore(newNode, node);
			}, this);

			// delete node when all others have been created
			root.removeChild(node);

			propertyMap = array.filter(toCreate, function(def) {
				return "property" in def;
			});

			array.forEach(propertyMap, function(data) {
				this._simpleBindCreateTextNodeUpdater(root, propertyMap, data);
			}, this);
		},

		_simpleBindCreateTextNodeUpdater: function(root, propertyMap, data) {

			var propertyName = data.property;
			var htmlEscape = !data.allowHTML;

			var update = lang.hitch(this, function(p, o, n) {

				var TEXT = 3;
				var node = root.childNodes[data.index];
				var content = this.get(propertyName);

				if (htmlEscape) {
					node.nodeValue = content;
				} else {
					this._simpleBindReplaceHTML(root, propertyMap, data, content);
				}
			});

			// call update to replace empty text node
			update();

			this.own(this.watch(propertyName, update));
		},

		_simpleBindReplaceHTML: function(root, propertyMap, data, content) {

			// Don't escape content
			var newContent = domConstruct.toDom(content);
			var childCountBefore = root.childNodes.length;
			var oldLength = data.length;
			var oldFirstNode = root.childNodes[data.index];
			var toDelete;

			// insert before first item in ref
			root.insertBefore(newContent, oldFirstNode);

			var newLength = root.childNodes.length - childCountBefore;
			var delta = newLength - oldLength;

			for (var i = oldLength; i > 0; i--) {
				toDelete = root.childNodes[data.index + newLength];
				root.removeChild(toDelete);
			}

			array.forEach(propertyMap, function(d) {
				if (d.index > data.index) {
					d.index += delta;
				}
			}, this);

			data.length = newLength;
		},

		_simpleBindAttributes: function(node) {
			var i;
			var attr;
			var name;
			var value;
			var format;
			var names;
			var values;
			var matches;
			var keepEven = function(o, index) {
				return index % 2 === 1;
			};

			for (i = 0; i < node.attributes.length; i++) {

				attr = node.attributes[i];
				value = attr.value;
				matches = value.split(this._simpleBindPropertyRegex);

				// exit if no properties are found
				if (matches && matches.length < 3) {
					break;
				}

				name = attr.name;
				format = value.replace(this._simpleBindPropertyRegex, "${$1}");

				// the names are the
				names = array.filter(matches, keepEven);

				// TODO: check for special attributes as "style" which can have sub keys/values
				// TODO: maybe do special code when attribute="{{propertyName}}"
				this._simpleBindCreateAttributeUpdater(node, name, names, format);
			}
		},

		_simpleBindCreateAttributeUpdater: function(node, attributeName, names, format) {

			var created = {};
			var uniqueNames = array.filter(names, function(propertyName) {
				if (propertyName in created) {
					return false;
				}
				created[propertyName] = true;
				return true;
			});

			var setAttribute = lang.hitch(this, function() {
				var data = {};

				array.forEach(uniqueNames, function(name) {
					data[name] = this.get(name);
				}, this);

				var newValue = string.substitute(format, data);

				domAttr.set(node, attributeName, newValue);
			});

			array.forEach(uniqueNames, function(propertyName, index) {
				this.own(this.watch(propertyName, setAttribute));
			}, this);

			setAttribute();
		}
	});
});
