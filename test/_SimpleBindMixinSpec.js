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

    describe("Bindable Text", function() {

        var cls;
        var CLS = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
            A: "X",
            B: "Y"
        });

        afterEach(function() {
            cls.destroy();
        });

        it("Should replace bindable text with property value at on creation", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            expect(cls.domNode.innerHTML).toBe('X');
        });

        it("Should replace bindable text with property value at on creation", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            cls.set("A", "Z");
            expect(cls.domNode.innerHTML).toBe('Z');
        });

        it("Should not create empty text nodes", function() {
            cls = new CLS({ templateString: '<div>{{A}}</div>' });
            expect(cls.domNode.childNodes.length).toBe(1);
        });

        it("Should handle multiple properties in text", function() {
            cls = new CLS({ templateString: '<div>{{A}} {{B}}</div>' });
            expect(cls.domNode.innerHTML).toBe("X Y");
            expect(cls.domNode.childNodes.length).toBe(3);
        });

        it("Should handle property replacement around dom nodes", function() {
            cls = new CLS({ templateString: '<div>{{A}}<h1>Title</h1>{{A}}</div>' });
            expect(cls.domNode.childNodes.length).toBe(3);
            expect(cls.domNode.childNodes[1].innerHTML).toBe("Title");
        });

        it("Should handle property replacement around dom nodes", function() {
            cls = new CLS({ templateString: '<div>{{A}}<h1>Title</h1>{{A}}</div>' });
            cls.set("A", "Q");
            expect(cls.domNode.childNodes.length).toBe(3);
            expect(cls.domNode.childNodes[0].nodeValue).toBe("Q");
            expect(cls.domNode.childNodes[1].innerHTML).toBe("Title");
            expect(cls.domNode.childNodes[2].nodeValue).toBe("Q");
        });

        it("Should handle property nested in nodes", function() {
            cls = new CLS({ templateString: '<div><h1>{{A}}</h1>{{A}}</div>' });
            cls.set("A", "Q");
            expect(cls.domNode.childNodes[0].innerHTML).toBe("Q");
            expect(cls.domNode.childNodes[1].nodeValue).toBe("Q");
        });
    });

});
