define(['dijit-simple-bind/_SimpleBindMixin','dojo/_base/lang'], function(_SimpleBindMixin,lang) {

  // jasmine
  describe('something', function() {
    it('should pass', function() {
      expect(true).toBe(true);
    });

    it('should trim using a dojo AMD module',function(){
       expect(lang.trim("  len4  ").length).toEqual(4);
    });
  });
});
