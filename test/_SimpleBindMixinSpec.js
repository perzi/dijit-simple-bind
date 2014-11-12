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

        afterEach(function() {
            cls.destroy();
        });
    });

    // describe("templateString namespacing", function() {
    //
    //     var cls;
    //     var CLS = declare([_WidgetBase, _TemplatedMixin, _SimpleBindMixin], {
    //         A: "X",
    //         B: "Y"
    //     });
    //
    //     afterEach(function() {
    //         cls.destroy();
    //     });
    // });



});
