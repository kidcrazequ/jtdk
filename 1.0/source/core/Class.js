/**
 * @project JSDK JavaScript Development Kit
 * @copyright Copyright(c) 2004-2012, Dragonfly.org. All rights reserved.
 * @license LGPLv3
 * @website http://jsdk2.sourceforge.net/website/index.html
 * 
 * @version 1.0.0
 * @author feng.chun
 * @date 2012-11-21
 * @date 2012-12-03
 * @date 2012-12-19
 * 
 * @requires /core/JS-base.js
 */
(function() {
/**
 * Only JSDK can creates Class objects.
 * @class JS.Class
 * @private
 * @constructor
 * @param {String} className
 * @throws {Error} when not found the class 
 */
JS.Class = function(classInfo, loader){
	if(!classInfo['extend'] && classInfo['className']!='JS.Object'){
		classInfo['extend'] = 'JS.Object';
	}
	
	this._info = classInfo;
	this._loader = loader;
	
	if(classInfo['className']=='JS.Object'){
		var pkg = loader.ns(this._info['packageName']);
		pkg[this._info['simpleName']] = JS.Object;
	}
	this._ctor = loader.ns(this._info['packageName'])[this._info['simpleName']];
	
	if(!this._ctor) throw new Error('Not found the class:<'+className+'> by loader.');
	this._ctor.$class = this;
	
	var me = this, o = this._ctor.prototype?this._ctor.prototype:this._ctor;
	o.getClass = function(){
		return me;
	}	
};

JS.mix(JS.Class.prototype, {
	/**
	 * Returns the class's loader.
	 * 
	 * @method getLoader
	 * @return {JS.Loader} 
	 */
	getLoader: function(){
		return this._loader;
	},
	/**
	 * Returns the class full name.
	 * 
	 * @method getName
	 * @return {String} full name
	 */
	getName: function(){
		return this._info['className']
	},
	/**
	 * Returns the class's package name.
	 * 
	 * @method getPackageName
	 * @return {String} package name
	 */
	getPackageName: function(){
		return this._info['packageName']
	},
	/**
	 * Returns the class's short name.
	 * 
	 * @method getSimpleName
	 * @return {String} short name
	 */
	getSimpleName: function(){
		return this._info['simpleName']
	},
	/**
	 * Returns the super class's full name.
	 * 
	 * @method getSuperName
	 * @return {String} super class name
	 */
	getSuperName: function(){
		return this._info['extend']
	},
	/**
	 * Returns True if the class is singleton, false otherwise.
	 * 
	 * @method isSingleton
	 * @return {Boolean} 
	 */
	isSingleton: function(){
		return !this._ctor.prototype;
	},
	/**
	 * Returns the class constructor function.
	 * 
	 * @method getCtor
	 * @return {Function} constructor function
	 */
	getCtor: function(){
		return this._ctor;
	},
	/**
	 * Returns the super class.
	 * 
	 * @method getSuperClass
	 * @return {JS.Class}
	 */
	getSuperClass: function(){
		return this._loader.findClass(this.getSuperName());
	},
	/**
	 * Returns a new instance of the class.
	 * 
	 * @method newInstance
	 * @param {Object..} arguments
	 * @return {Object}
	 */
	newInstance: function(){		
		var f = function(){};
		f.prototype = this._ctor.prototype;
		var obj = new f();
		this._ctor.apply(obj, arguments);
		return obj;
	},
	/**
	 * Returns True if two classes's name and loader are equals, false otherwise.
	 * 
	 * @method equals
	 * @param {JS.Class} clazz
	 * @return {Boolean}
	 */
	equals: function(clazz){
		return clazz && this.getName()===clazz.getName();
	},
	/**
	 * Returns the classe's all fields.
	 * 
	 * @method getFieldNames
	 * @return {Array<String>}
	 */
	getFieldNames: function(){
		var arr = [], fields = this._ctor['_fields'];
		for(var k in fields){
			arr.push(k);
		}
		return arr;
	},
	/**
	 * Returns the classe's all methods, exclude constructor.
	 * 
	 * @method getMethodNames
	 * @return {Array<String>}
	 */
	getMethodNames: function(){
		var arr = [], methods = this._ctor['prototype'];
		for(var k in methods){
			if(k!='constructor') arr.push(k);
		}
		return arr;
	},
	/**
	 * Reflective invoke a field's value.
	 * 
	 * @method getFieldValue
	 * @param {Object} obj the class instance
	 * @param {String} fieldName the field name
	 * @return {Object}
	 */
	getFieldValue: function(obj, fieldName){
		return obj['_'+fieldName];
	},
	/**
	 * Reflective invoke a field's value.
	 * 
	 * @method setFieldValue
	 * @param {Object} obj the class instance
	 * @param {String} fieldName the field name
	 * @param {Object} newValue the field name
	 */
	setFieldValue: function(obj, fieldName, newValue){
		return obj['set'+(fieldName.substring(0,1).toUpperCase()+fieldName.slice(1))](newValue);
	},
	/**
	 * Reflective invoke a method.
	 * 
	 * @method invokeMethod
	 * @param {Object} obj the class instance
	 * @param {String} methodName the field name
	 * @param {Object..} args arguments for the method
	 */
	invokeMethod: function(obj, methodName, args){
		return obj[methodName].apply(obj, [].slice.call(arguments, 2));
	}	
});

JS.mix(JS.Class, {
	/**
	 * Find Class for name.
	 * 
	 * @method forName
	 * @static
	 * @param {String} className
	 * @param {JS.Loader} loader:optional
	 * @return {JS.Class}
	 */
	forName: function(className, loader){
		var l = loader||JS.ClassLoader;
		return l.findClass(className);
	},
	/**
	 * Returns true if the test object is a class, false otherwise.
	 * 
	 * @method isClass
	 * @static
	 * @param {String|Object} clazz
	 * @param {JS.Loader} loader:optional
	 * @return {Boolean}
	 */
	isClass: function(clazz, loader){
		if(JS.isString(clazz)) return this.forName(clazz,loader)?true:false;		
		return JS.hasOwnProperty(clazz, '$class');
	}
});

JS.ClassBuilder = {
	_extend: function(subc, superc) {
	    var F = function() {};
        F.prototype = superc.prototype;
        subc.prototype = new F();
        subc.prototype.constructor = subc;
        subc.superclass = superc.prototype;
        if (superc != Object && superc.prototype.constructor == Object.prototype.constructor) {
            superc.prototype.constructor = superc;
        }
	},
	_overrides: function(subc, overrides, statics){
		// add prototype overrides
	    if (overrides) {
	    	JS.mix(subc.prototype, overrides);
	    }

	    // add static overrides
	    if (statics) {
	        JS.mix(subc, statics);
	    }
	},
	_catchData: function(data, key, defaultValue){
		var v = data[key];
		if(JS.isEmpty(v)) v = defaultValue;
		
		if(key in data) {
			delete data[key];
		}
		return v;
	},
	_upper: function(str){
		return str.substring(0,1).toUpperCase()+str.slice(1);
	},
	_getRealFieldName: function(fname){
		if(fname.startsWith('get$') || fname.startsWith('set$')) return fname.length>4?fname.slice(4):null;
		return fname;
	},
	_genConstructorFields: function(thisp, fields){
		for(var k in fields){
			var realFName = this._getRealFieldName(k);
			if(!realFName) continue;
			thisp['_'+realFName] = fields[k];
		}
	},
	_handleField: function(classSelf, fname, defaultValue, data){
		var changing = this._catchData(data,'changing'+this._upper(fname),null), 
			changed = this._catchData(data,'changed'+this._upper(fname),null), 
			apply = this._catchData(data,'apply'+this._upper(fname),null); 
			
		if(!classSelf['_fields']) classSelf['_fields'] = {};
		var ofs = {defaultValue: defaultValue};
		if(changing) ofs['changing'] = changing;
		if(changed) ofs['changed'] = changed;
		if(apply) ofs['apply'] = apply;
		classSelf['_fields'][fname] = ofs;
	},
	_handleFields: function(classSelf, fields, data){
		for(var k in fields){
			var realFName = this._getRealFieldName(k);
			if(!realFName) continue;
			this._handleField(classSelf, realFName, fields[k], data);
		}
	},
	_genMethods4Fields: function(classSelf, fields){
		var classp = classSelf.prototype;
		for(var k in fields){
			if(k.startsWith('get$')){
				k = k.length>4?k.slice(4):null;
				if(!k) continue;
				classp['get'+this._upper(k)] = this._getterFn(k);				
			}else if(k.startsWith('set$')){
				k = k.length>4?k.slice(4):null;
				if(!k) continue;
				classp['set'+this._upper(k)] = this._setterFn(k, classSelf);	
			}else {
				classp['get'+this._upper(k)] = this._getterFn(k);
				classp['set'+this._upper(k)] = this._setterFn(k, classSelf);
			}
		}
	},
	_getterFn: function(key){
		return function(v){
			return this['_'+key];
		}
	},
	_setterFn: function(key, classSelf){
		var me = this;
		
		return function(newv){
			var oldv = this['_'+key],
				isChanged = oldv!==newv,
				onfield = classSelf['_fields'][key];
			
			if(isChanged){
				me._fireOnField(onfield, 'changing', oldv, newv, this);				
			}			
			
			var onApplyFn = onfield['apply'];
			if(onApplyFn){
				this['_'+key] = onApplyFn.call(this, oldv, newv);
			}else{
				this['_'+key] = newv;
			}			
			
			if(isChanged){
				me._fireOnField(onfield, 'changed', oldv, this['_'+key], this);				
			}
		}
	},
	_fireOnField: function(onfield, ename, oldV, newV, thisp){
		var fn = onfield[ename];
		if(fn) fn.call(thisp, oldV, newV);
	},
	_mixs: function(classp, mixs, loader){
		for ( var i = 0; i < mixs.length; i++) {
			var ctor = loader.findClass(mixs[i]).getCtor();			
			JS.mix(classp.prototype, ctor.prototype);
		}
	},
	build: function(classInfo, data, loader){
		if(loader.hasClass(classInfo['className'])) return false;
		
		var depends = classInfo['depends'];
		for ( var i = 0; i < depends.length; i++) {
			if(!loader.hasClass(depends[i])) return false;
		}
		
		return this._build(classInfo, data, loader);
	},
	_build: function(classInfo, data, loader){
		var pkg = loader.ns(classInfo.packageName),
			sname = classInfo.simpleName,
		    fname = classInfo.className;
		
		var conFn = this._catchData(data,'constructor',function(){}), 
			extend = this._catchData(data,'extend','JS.Object'),
			singleton = this._catchData(data,'singleton',false),
			statics = this._catchData(data,'statics'),
			fields = this._catchData(data,'fields',{}),
			mixins = Array.toArray(this._catchData(data,'mixins',[]));
		delete data['requires'];
		
		var subc = null;
		if(singleton){
			pkg[sname] = {
				superclass: JS.Object.prototype	
			};
			subc = pkg[sname];
			JS.mix(subc, JS.Object.prototype);			
			JS.mix(subc, statics);
			JS.mix(subc, data);
		}else{
			var me = this;
			pkg[sname] = function(){
				pkg[sname].superclass.constructor.apply(this, arguments);				
				
				me._genConstructorFields(this, fields);
				conFn.apply(this, arguments);				
			}
			subc = pkg[sname];
			this._handleFields(subc, fields, data);
			
			var superCtor = loader.findClass(extend).getCtor();			
			this._extend(subc, superCtor);
			this._mixs(subc, mixins, loader);
			this._overrides(subc, data, statics);
			this._genMethods4Fields(subc, fields);			
		}
		return true;
	}
}

})();