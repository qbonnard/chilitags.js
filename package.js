Package.describe({
	summary: "Chilitags-CHILI-EPFL's JavaScript tools for augmented reality"
});

Package.on_use(function (api, where) {
 	api.add_files('chilitags.js', 'client');
 	api.export(['Module'], 'client');
});
