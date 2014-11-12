define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit-simple-bind/_SimpleBindMixin'
], function(
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _SimpleBindMixin
) {

    describe("templateString namespacing", function() {

        var cls;
        var CLS = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            A: "X",
            B: "Y"
        });

        afterEach(function() {
            cls.destroy();
        });

        it("Should transform templateString for attributes", function() {
            cls = new CLS({ templateString: '<div class="{{A}}"></div>' });
            expect(cls.templateString).toBe('<div class="{{1:A}}"></div>');
        });

        it("Should transform templateString for textnodes", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            expect(cls.templateString).toBe('<div>{{2:A}}</div>');
        });

        it("Should increse counter for namespacing", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            expect(cls.templateString).toBe('<div>{{3:A}}</div>');
        });

        it("Should transform templateString for multiple  textnodes", function() {
            cls = new CLS({ templateString: '<div>{{A}} {{A}}</div>' });
            expect(cls.templateString).toBe('<div>{{4:A}} {{4:A}}</div>');
        });

        it("Should transform templateString multiple attributes", function() {
            cls = new CLS({ templateString: '<div class="{{A}} {{A}}"></div>' });
            expect(cls.templateString).toBe('<div class="{{5:A}} {{5:A}}"></div>');
        });

        it("Should transform templateString for all properties", function() {
            cls = new CLS({ templateString: '<div class="{{A}} {{B}}">{{B}} {{A}}</div>' });
            expect(cls.templateString).toBe('<div class="{{6:A}} {{6:B}}">{{6:B}} {{6:A}}</div>');
        });

        it("Should accept whitespace around property name", function() {
            cls = new CLS({ templateString: '<div class="{{ A }} {{ B }}">{{ B }} {{ A }}</div>' });
            expect(cls.templateString).toBe('<div class="{{7:A}} {{7:B}}">{{7:B}} {{7:A}}</div>');
        });

    });

    describe("Bindable Attributes", function() {

        var cls;
        var CLS = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            A: "X",
            B: "Y"
        });

        afterEach(function() {
            cls.destroy();
        });

        it("Should replace bindable attribute with property value at on creation", function() {
            cls = new CLS({ templateString: '<div class="{{A}}"></div>' });
            expect(cls.domNode.className).toBe('X');
        });

        it("Should update bindable attribute when property value is set", function() {
            cls = new CLS({ templateString: '<div class="{{A}}"></div>' });
            cls.set("A", "Z");
            expect(cls.domNode.className).toBe('Z');
        });

        it("Should update multiple bindable attributes when properties are set", function() {
            cls = new CLS({ templateString: '<div class="{{A}} {{B}}"></div>' });
            cls.set("A", "Z");
            cls.set("B", "W");
            expect(cls.domNode.className).toBe('Z W');
        });

        it("Should keep static values in bindable attributes when property value is set", function() {
            cls = new CLS({ templateString: '<div class="q{{A}}w"></div>' });
            cls.set("A", "Z");
            expect(cls.domNode.className).toBe('qZw');
        });
    });



});
