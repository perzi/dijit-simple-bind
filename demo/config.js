dojoConfig = {
	parseOnLoad: false,
	async: true,
	isDebug: true,
	locale: "en-us",
	baseUrl: "/",
	packages:[
		{
			name: "dijit-simple-bind",
			location: location.pathname.replace(/\/[^/]+$/, '') + '/../src'
		},
		{
			name: "demo",
			location: location.pathname.replace(/\/[^/]+$/, '') + '/components'
		}
	]
};
