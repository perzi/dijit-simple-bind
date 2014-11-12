var allTestFiles = [];
var TEST_REGEXP = /.*Spec\.js$/;

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        allTestFiles.push(file);
    }
});

var dojoConfig = {
    packages: [
        { name:"dijit-simple-bind" ,location:"/base"},
        { name: "dojo", location: "http://ajax.googleapis.com/ajax/libs/dojo/1.9.1/dojo" },
        { name: "dijit", location: "http://ajax.googleapis.com/ajax/libs/dojo/1.9.1/dijit" }
    ],
    asynch: true
};


/**
 * This function must be defined and is called back by the dojo adapter
  * @returns {string} a list of dojo spec/test modules to register with your testing framework
 */
window.__karma__.dojoStart = function(){
    return allTestFiles;
};
