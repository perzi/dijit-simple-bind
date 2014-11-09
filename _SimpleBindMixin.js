define([
	"dojo/_base/declare",
	"dojo/string"
], function(
	declare,
	string
) {
	// variable to use for namespacing properties before buildRendering
	var _bindiId = 0;

	return declare(null, {

		bindPropertyExpression: /\{\{([\$_\-\w\d]+)\}\}/g,
		bindNamespacedPropertyExpression: /\{\{[\$_\-\w\d]+:[\$_\-\w\d]+\}\}/g,

		postMixInProperties: function() {
			this.inherited(arguments);

			// increase id counter
			_bindiId++;

			// convert names to namespaced names
			// {{property}} -> {{<_bindiId>:property}}
			var nameSpacedDynamicProperty = string.substitute("{{${0}:$1}}", [_bindiId]);
			var namespacedTemplateString = this.templateString.replace(this.bindPropertyExpression, nameSpacedDynamicProperty);

			// update templateString
			this.templateString = namespacedTemplateString;
		}
	});
});
