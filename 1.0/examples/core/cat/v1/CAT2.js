JS.define('my.CAT2',{
	singleton: true,
	color: 'Black',	
	getColor: function(){
		return this.color;
	},
	statics: {
    	Version:'1.0'
    },
    mixins:['my.Sleep']
});

