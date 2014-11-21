define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/query",
	"dojo/string",

	"dijit/registry",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/NodeList-traverse"
], function(
	array,
	declare,
	lang,
	domAttr,
	domConstruct,
	on,
	query,
	string,

	registry,
	_WidgetsInTemplateMixin
) {
	// variable to use for namespacing properties before buildRendering
	var idCounter = 0;

	return declare(null, {

		// _simpleBindPropertyRegex: [private] RegEx
		//		Regular expression to match bindable properties
		_simpleBindPropertyRegex: /\{\{([^\}]+)\}\}/g,

		_simpleBindTextPropertyMap: null,
		_simpleBindAttributePropertyMap: null,

		constructor: function() {
			this._simpleBindTextPropertyMap = {};
			this._simpleBindAttributePropertyMap = [];
		},

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
			this._simpleBindScanNode(this.domNode);

			// bind text property uptaters
			for (var property in this._simpleBindTextPropertyMap) {
				var definitions = this._simpleBindTextPropertyMap[property];
				this._simpleBindCreateTextNodeUpdater(property, definitions);
			}

			// bind attribute property uptaters
			array.forEach(this._simpleBindAttributePropertyMap, function(definition) {
				this._simpleBindCreateAttributeUpdater(definition);
			}, this);

		},

		_simpleBindScanNode: function(root) {

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
						this._simpleBindScanNode(node);

					} else if (isMyContainerNode) {
						// check attributes in my containernode
						this._simpleBindAttributes(node);

					} else if (domAttr.has(node, "widgetid")) {
						// it's a child widget
						widget = registry.byNode(node);

						// only continue if the node has a containerNode
						if (widget.containerNode) {
							this._simpleBindScanNode(node);
						}
					}
				}
			}
		},

		_simpleBindAddToTextMap: function(property, data) {

			if (this._simpleBindTextPropertyMap[property]) {
				this._simpleBindTextPropertyMap[property].push(data);
			} else {
				this._simpleBindTextPropertyMap[property] = [data];
			}
		},

		_simpleBindTextNode: function(node) {

			var root = node.parentNode;
			var matches = node.nodeValue.split(this._simpleBindPropertyRegex);
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
			var createdIndex = 0;
			var related = [];

			array.forEach(matches, function(match, index) {

				var content = "";
				var newNode;

				// don't create empty content
				if (match.length === 0) {
					return;
				}

				if (index % 2 === 0) {
					// static content
					content = match;
				} else {
					var options = match.split(/^!|:/g);
					var allowHTML = options[0] === "";
					var propertyName = options[allowHTML ? 1 : 0];
					var formatting = options[allowHTML ? 2 : 1];

					// TODO: track if this item is the only child node
					// then we can use simpler replacement when updating
					var definition = {
						type: "text",
						node: root,
						property: propertyName,
						allowHTML: allowHTML,
						formatting: formatting,
						index: baseIndex + createdIndex,
						length: 1,
						related: related // shared map for text nodes in same parent
					};

					related.push(definition);

					// add definition to map
					this._simpleBindAddToTextMap(propertyName, definition);
				}

				newNode = document.createTextNode(content);
				root.insertBefore(newNode, node);

				createdIndex++;
			}, this);

			// delete node when all others have been created
			root.removeChild(node);
		},

		_simpleBindCreateTextNodeUpdater: function(property, definitions) {

			var update = lang.hitch(this, function(p, o, n) {

				array.forEach(definitions, function(definition) {
					var root = definition.node;
					var node = root.childNodes[definition.index];
					var content = this.get(property);

					// TODO: use a single updater if node.parentNode.childNodes.length === 1

					if (definition.allowHTML) {
						this._simpleBindReplaceWithHTML(root, definition, content);
					} else {
						node.nodeValue = content;
					}
				}, this);
			});

			// own
			this.own(this.watch(property, update));

			// call update to replace empty text node
			update();
		},

		_simpleBindReplaceWithHTML: function(root, definition, content) {

			// Don't escape content
			var newContent = domConstruct.toDom(content);
			var childCountBefore = root.childNodes.length;
			var oldLength = definition.length;
			var oldFirstNode = root.childNodes[definition.index];
			var toDelete;

			// insert before first item in ref
			root.insertBefore(newContent, oldFirstNode);

			var newLength = root.childNodes.length - childCountBefore;
			var delta = newLength - oldLength;

			for (var i = oldLength; i > 0; i--) {
				toDelete = root.childNodes[definition.index + newLength];
				root.removeChild(toDelete);
			}

			array.forEach(definition.related, function(d) {
				if (d.index > definition.index) {
					d.index += delta;
				}
			}, this);

			definition.length = newLength;
		},

		_simpleBindAttributes: function(node) {

			// var attr;
			// var name;
			// var value;
			// var format;
			// var names;
			// var values;
			// var matches;
			// var isExact;
			var keepEven = function(o, index) {
				return index % 2 === 1;
			};

			array.forEach(node.attributes, function(attr, index) {

				var value = attr.value;
				var matches = value.split(this._simpleBindPropertyRegex);

				// exit if no properties are found
				if (!matches || matches.length < 3) {
					return;
				}

				var name = attr.name;
				var format = value.replace(this._simpleBindPropertyRegex, "${$1}");

				// the names are the
				var names = this._simpleBindGetUniqueNames(array.filter(matches, keepEven));

				var isExact = (matches.length === 1) || (matches.length === 3) &&
				matches[0] === "" &&
				matches[1] === names[0] &&
				matches[2] === "";

				// TODO: check for special attributes as "style" which can have sub keys/values
				// TODO: maybe do special code when attribute="{{propertyName}}"
				//this._simpleBindCreateAttributeUpdater(node, name, names, format);

				this._simpleBindAttributePropertyMap.push({
					node: node,
					attributeName: name,
					names: names,
					format: format,
					exact: isExact
				});

			}, this);

			// for (i = 0; i < node.attributes.length; i++) {
			//
			// 	attr = node.attributes[i];
			// }
		},

		_simpleBindGetUniqueNames: function(names) {
			var found = {};
			var uniqueNames = array.filter(names, function(name) {
				if (name in found) {
					return false;
				}
				found[name] = true;
				return true;
			});

			return uniqueNames;
		},

		_simpleBindCreateAttributeUpdater: function(definition) {

			var node = definition.node;
			var attributeName = definition.attributeName;
			var names = definition.names;
			var format = definition.format;
			var exact = definition.exact;
			var firstTime = true;

			// TODO: each name could have their own formatter for the value

			var setFormattedAttribute = lang.hitch(this, function() {
				var data = {};

				array.forEach(names, function(name) {
					data[name] = this.get(name);
				}, this);

				// use the data object that has
				var newValue = string.substitute(format, data);

				domAttr.set(node, attributeName, newValue);
			});

			// TODO: handle checked and disabled attributes, and onChange...
			var setSingleAttribute = lang.hitch(this, function() {
				var newValue = this.get(names[0]);
				domAttr.set(node, attributeName, newValue);
				// if (firstTime) {
				// 	node.getAttribute(attributeName).nodeValue = newValue;
				// 	firstTime = false;
				// }
			});

			if (exact) {
				// nodes that have a value
				// is it a form node with a value
				if (attributeName === "value") {
					this._simpleBindAttributeValue(definition);
				} else {
					this.own(this.watch(names[0], setSingleAttribute));
					setSingleAttribute();
				}
			} else {
				array.forEach(names, function(propertyName, index) {
					this.own(this.watch(propertyName, setFormattedAttribute));
				}, this);
				setFormattedAttribute();
			}
		},

		_simpleBindAttributeValue: function(definition) {
			var node = definition.node;
			var attributeName = definition.attributeName;
			var name = definition.names[0];
			var inProgress = false;

			var updateFromNode = lang.hitch(this, function() {

				if (inProgress) {
					return;
				}

				inProgress = true;
				this.set(name, node.value);
				inProgress = false;
			});

			var updateFromProperty = lang.hitch(this, function(p, o, value) {

				if (inProgress) {
					return;
				}

				inProgress = true;
				node.value = this.get(name);
				inProgress = false;
			});

			this.own(
				on(node, "change", updateFromNode),
				this.watch(name, updateFromProperty)
			);
		}
	});
});
