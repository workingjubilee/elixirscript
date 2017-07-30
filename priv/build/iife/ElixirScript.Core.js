var ElixirScript=function(){'use strict';/* @flow */function namedVariableResult(a,b){return new NamedVariableResult(a,b)}/* @flow */function is_number(a){return'number'==typeof a}function is_string(a){return'string'==typeof a}function is_boolean(a){return'boolean'==typeof a}function is_symbol(a){return'symbol'==typeof a}function is_object(a){return'object'==typeof a}function is_variable(a){return a instanceof Variable}function is_null(a){return null===a}function is_array(a){return Array.isArray(a)}function is_function(a){return'[object Function]'==Object.prototype.toString.call(a)}function is_map(a){return a instanceof Map}function resolveNull(){return function(a){return is_null(a)}}function resolveWildcard(){return function(){return!0}}function resolveObject(a){let b={};const c=Object.keys(a).concat(Object.getOwnPropertySymbols(a));for(let d of c)b[d]=buildMatch(a[d]);return function(d,e){if(!is_object(d)||a.length>d.length)return!1;for(let a of c)if(!(a in d)||!b[a](d[a],e))return!1;return!0}}function getSize(a,b){return a*b/8}function arraysEqual(c,a){if(c===a)return!0;if(null==c||null==a)return!1;if(c.length!=a.length)return!1;for(var b=0;b<c.length;++b)if(c[b]!==a[b])return!1;return!0}function fillArray(a,b){for(let c=0;c<b;c++)a.push(0)}function createBitString(a){let b=a.map((a)=>f.integer(a));return new f(...b)}function resolveNoMatch(){return function(){return!1}}function buildMatch(a){if(null===a)return resolveNull(a);if('undefined'==typeof a)return resolveWildcard(a);const b=a.constructor.prototype,c=g.get(b);return c?c(a):'object'==typeof a?resolveObject(a):resolveNoMatch()}function defmatchgen(...a){const b=getArityMap(a);return function*(...a){let[c,d]=findMatchingFunction(a,b);return yield*c.apply(this,d)}}function findMatchingFunction(a,b){if(b.has(a.length)){const c=b.get(a.length);let d=null,e=null;for(let b of c){let c=[];a=fillInOptionalValues(a,b.arity,b.optionals);const f=b.pattern(a,c),[g,h]=checkNamedVariables(c);if(f&&h&&b.guard.apply(this,g)){d=b.fn,e=g;break}}if(!d)throw console.error('No match for:',a),new MatchError(a);return[d,e]}throw console.error('Arity of',a.length,'not found. No match for:',a),new MatchError(a)}function getArityMap(a){let b=new Map;for(const c of a){const a=getArityRange(c);for(const d of a){let a=[];b.has(d)&&(a=b.get(d)),a.push(c),b.set(d,a)}}return b}function getArityRange(a){const b=a.arity-a.optionals.length,c=a.arity;let d=[b];for(;d[d.length-1]!=c;)d.push(d[d.length-1]+1);return d}function getOptionalValues(a){let b=[];for(let c=0;c<a.length;c++)a[c]instanceof Variable&&a[c].default_value!=Symbol.for('tailored.no_value')&&b.push([c,a[c].default_value]);return b}function fillInOptionalValues(a,b,c){if(a.length===b||0===c.length)return a;if(a.length+c.length<b)return a;let d=b-a.length,e=c.length-d,f=c.slice(e);for(let[d,e]of f)if(a.splice(d,0,e),a.length===b)break;return a}function checkNamedVariables(a){const b={},c=[];for(let d=0;d<a.length;d++){const e=a[d];if(e instanceof NamedVariableResult){if(b[e.name]&&b[e.name]!==e.value)return[a,!1];b[e.name]&&b[e.name]===e.value?c.push(e.value):(b[e.name]=e.value,c.push(e.value))}else c.push(e)}return[c,!0]}function match_or_default(a,b,c=()=>!0,d=null){let e=[],f=buildMatch(a);const g=f(b,e),[h,i]=checkNamedVariables(e);return g&&i&&c.apply(this,h)?h:d}function run_generators(a,b){if(0==b.length)return a.map((a)=>{return Array.isArray(a)?a:[a]});const c=b.pop();let d=[];for(let e of c())for(let b of a)d.push([e].concat(b));return run_generators(d,b)}function iterator_to_reducer(a,b,c){const d=a[Symbol.iterator]();let e=d.next(),f=b;for(;!1===e.done;){if(f=c(e.value,f.get(1)),f.get(0)===Symbol.for('halt'))return new r.Tuple(Symbol.for('halted'),f.get(1));if(f.get(0)===Symbol.for('suspend'))return new r.Tuple(Symbol.for('suspended'),f.get(1),(a)=>{return iterator_to_reducer(d,a,c)});e=d.next()}return new r.Tuple(Symbol.for('done'),f.get(1))}function map_to_object(a){const b={};for(const[c,d]of a.entries())b[c]=d instanceof Map?map_to_object(d):d;return b}function run_list_generators(a,b){if(0==b.length)return a.map((a)=>{return Array.isArray(a)?a:[a]});const c=b.pop(),d=[];for(const e of c())for(const b of a)d.push([e].concat(b));return run_list_generators(d,b)}// http://erlang.org/doc/man/lists.html
function reverse(a){return[...a]}function flatten(a,b=[]){const c=a.reduce((a,b)=>{return Array.isArray(b)?a.concat(flatten(b)):a.concat(b)},[]);return c.concat(b)}function foldl(a,b,c){return c.reduce((b,c)=>{return a(c,b)},b)}function keyfind(a,b,c){for(const d of c)if(d.get(b-1)===a)return d;return!1}function keydelete(a,b,c){const d=[];let e=!1;for(let f=0;f<c.length;f++)!1==e&&c[f].get(b-1)===a?e=!0:d.push(c[f]);return d}// http://erlang.org/doc/man/erlang.html
function atom_to_binary(a,b=Symbol.for('utf8')){if(b!==Symbol.for('utf8'))throw new Error(`unsupported encoding ${b}`);return a.__MODULE__?Symbol.keyFor(a.__MODULE__):Symbol.keyFor(a)}function binary_to_atom(a,b=Symbol.for('utf8')){if(b!==Symbol.for('utf8'))throw new Error(`unsupported encoding ${b}`);return Symbol.for(a)}function is_bitstring$1(a){return a instanceof e.BitString}function is_number$1(a){return'number'==typeof a||a instanceof Number}function is_integer(a){return b(a)}function is_binary(a){return'string'==typeof a||a instanceof String}function iolist_to_binary(b){if(console.log(b),null===b)return'';if(is_binary(b))return b;if(is_bitstring$1(b))return a(...b.value);if(is_number$1(b))return a(b);const c=i.flatten(b);console.log(c);const d=c.reduce((b,c)=>{return null===c?b:is_integer(c)?b+a(c):is_bitstring$1(c)?b+a(...c.value):b+iolist_to_binary(c)},'');return d}function is_key(a,b){return b.has(a)}function put$1(a,b){return p.get(o).set(a,b),Symbol.for('ok')}function get$1(a){return p.get(o).get(a)}function get_key(a){let b=a;if(__elixirscript_names__.has(a)&&(b=__elixirscript_names__.get(a)),__elixirscript_store__.has(b))return b;throw new Error(`Key ${b} not found`)}var a=String.fromCodePoint,b=Number.isInteger;class Variable{constructor(a=null,b=Symbol.for('tailored.no_value')){this.name=a,this.default_value=b}}class Wildcard{constructor(){}}class StartsWith{constructor(a){this.prefix=a}}class Capture{constructor(a){this.value=a}}class HeadTail{constructor(a,b){this.head=a,this.tail=b}}class Type{constructor(a,b={}){this.type=a,this.objPattern=b}}class Bound{constructor(a){this.value=a}}class BitStringMatch{constructor(...a){this.values=a}length(){return values.length}bit_size(){return 8*this.byte_size()}byte_size(){let a=0;for(let b of this.values)a+=b.unit*b.size/8;return a}getValue(a){return this.values(a)}getSizeOfValue(a){let b=this.getValue(a);return b.unit*b.size}getTypeOfValue(a){return this.getValue(a).type}}class NamedVariableResult{constructor(a,b){this.name=a,this.value=b}}class Tuple{constructor(...a){this.values=Object.freeze(a),this.length=this.values.length}get(a){return this.values[a]}count(){return this.values.length}[Symbol.iterator](){return this.values[Symbol.iterator]()}toString(){let a,b='';for(a=0;a<this.values.length;a++){''!=b&&(b+=', ');const c=this.values[a]?this.values[a].toString():'';b+=c}return'{'+b+'}'}put_elem(a,b){if(a===this.length){let a=this.values.concat([b]);return new Tuple(...a)}let c=this.values.concat([]);return c.splice(a,0,b),new Tuple(...c)}remove_elem(a){let b=this.values.concat([]);return b.splice(a,1),new Tuple(...b)}}let c=-1;let d=-1;class BitString$1{constructor(...a){this.value=Object.freeze(this.process(a)),this.length=this.value.length,this.bit_size=8*this.length,this.byte_size=this.length}get(a){return this.value[a]}count(){return this.value.length}slice(a,b=null){let c=this.value.slice(a,b),d=c.map((a)=>BitString$1.integer(a));return new BitString$1(...d)}[Symbol.iterator](){return this.value[Symbol.iterator]()}toString(){var a,b='';for(a=0;a<this.count();a++)''!=b&&(b+=', '),b+=this.get(a).toString();return'<<'+b+'>>'}process(a){let b=[];var c;for(c=0;c<a.length;c++){let d=this['process_'+a[c].type](a[c]);for(let b of a[c].attributes)d=this['process_'+b](d);b=b.concat(d)}return b}process_integer(a){return a.value}process_float(a){if(64===a.size)return BitString$1.float64ToBytes(a.value);if(32===a.size)return BitString$1.float32ToBytes(a.value);throw new Error('Invalid size for float')}process_bitstring(a){return a.value.value}process_binary(a){return BitString$1.toUTF8Array(a.value)}process_utf8(a){return BitString$1.toUTF8Array(a.value)}process_utf16(a){return BitString$1.toUTF16Array(a.value)}process_utf32(a){return BitString$1.toUTF32Array(a.value)}process_signed(a){return new Uint8Array([a])[0]}process_unsigned(a){return a}process_native(a){return a}process_big(a){return a}process_little(a){return a.reverse()}process_size(a){return a}process_unit(a){return a}static integer(a){return BitString$1.wrap(a,{type:'integer',unit:1,size:8})}static float(a){return BitString$1.wrap(a,{type:'float',unit:1,size:64})}static bitstring(a){return BitString$1.wrap(a,{type:'bitstring',unit:1,size:a.bit_size})}static bits(a){return BitString$1.bitstring(a)}static binary(a){return BitString$1.wrap(a,{type:'binary',unit:8,size:a.length})}static bytes(a){return BitString$1.binary(a)}static utf8(a){return BitString$1.wrap(a,{type:'utf8',unit:1,size:a.length})}static utf16(a){return BitString$1.wrap(a,{type:'utf16',unit:1,size:2*a.length})}static utf32(a){return BitString$1.wrap(a,{type:'utf32',unit:1,size:4*a.length})}static signed(a){return BitString$1.wrap(a,{},'signed')}static unsigned(a){return BitString$1.wrap(a,{},'unsigned')}static native(a){return BitString$1.wrap(a,{},'native')}static big(a){return BitString$1.wrap(a,{},'big')}static little(a){return BitString$1.wrap(a,{},'little')}static size(a,b){return BitString$1.wrap(a,{size:b})}static unit(a,b){return BitString$1.wrap(a,{unit:b})}static wrap(a,b,c=null){let d=a;return a instanceof Object||(d={value:a,attributes:[]}),d=Object.assign(d,b),c&&d.attributes.push(c),d}static toUTF8Array(a){for(var b,c=[],d=0;d<a.length;d++)b=a.charCodeAt(d),128>b?c.push(b):2048>b?c.push(192|b>>6,128|63&b):55296>b||57344<=b?c.push(224|b>>12,128|63&b>>6,128|63&b):(d++,b=65536+((1023&b)<<10|1023&a.charCodeAt(d)),c.push(240|b>>18,128|63&b>>12,128|63&b>>6,128|63&b));return c}static toUTF16Array(a){for(var b,c=[],d=0;d<a.length;d++)b=a.codePointAt(d),255>=b?(c.push(0),c.push(b)):(c.push(255&b>>8),c.push(255&b));return c}static toUTF32Array(a){for(var b,c=[],d=0;d<a.length;d++)b=a.codePointAt(d),255>=b?(c.push(0),c.push(0),c.push(0),c.push(b)):(c.push(0),c.push(0),c.push(255&b>>8),c.push(255&b));return c}//http://stackoverflow.com/questions/2003493/javascript-float-from-to-bits
static float32ToBytes(a){var b=[],c=new ArrayBuffer(4);new Float32Array(c)[0]=a;let d=new Uint32Array(c)[0];return b.push(255&d>>24),b.push(255&d>>16),b.push(255&d>>8),b.push(255&d),b}static float64ToBytes(a){var b=[],c=new ArrayBuffer(8);new Float64Array(c)[0]=a;var d=new Uint32Array(c)[0],e=new Uint32Array(c)[1];return b.push(255&e>>24),b.push(255&e>>16),b.push(255&e>>8),b.push(255&e),b.push(255&d>>24),b.push(255&d>>16),b.push(255&d>>8),b.push(255&d),b}}var e={Tuple,PID:class PID{constructor(){++c,this.id=c}toString(){return'PID#<0.'+this.id+'.0>'}},Reference:class Reference{constructor(){++d,this.id=d,this.ref=Symbol()}toString(){return'Ref#<0.0.0.'+this.id+'>'}},BitString:BitString$1};/* @flow */const f=e.BitString,g=new Map;g.set(Variable.prototype,function resolveVariable(a){return function(b,c){return null===a.name?c.push(b):!a.name.startsWith('_')&&c.push(namedVariableResult(a.name,b)),!0}}),g.set(Wildcard.prototype,resolveWildcard),g.set(HeadTail.prototype,function resolveHeadTail(a){const b=buildMatch(a.head),c=buildMatch(a.tail);return function(a,d){if(!is_array(a)||0===a.length)return!1;const e=a[0],f=a.slice(1);return b(e,d)&&c(f,d)}}),g.set(StartsWith.prototype,function resolveStartsWith(a){const b=a.prefix;return function(a,c){return is_string(a)&&a.startsWith(b)&&(c.push(a.substring(b.length)),!0)}}),g.set(Capture.prototype,function resolveCapture(a){const b=buildMatch(a.value);return function(a,c){return!!b(a,c)&&(c.push(a),!0)}}),g.set(Bound.prototype,function resolveBound(a){return function(b){return typeof b==typeof a.value&&b===a.value}}),g.set(Type.prototype,function resolveType(a){return function(b,c){if(b instanceof a.type){const d=buildMatch(a.objPattern);return d(b,c)}return!1}}),g.set(BitStringMatch.prototype,function resolveBitString(a){let b=[];for(let c of a.values)if(is_variable(c.value)){let a=getSize(c.unit,c.size);fillArray(b,a)}else b=b.concat(new f(c).value);let c=a.values;return function(a,d){var e=String.fromCharCode;let g=null;if(!is_string(a)&&!(a instanceof f))return!1;g=is_string(a)?new f(f.binary(a)):a;let h=0;for(let f,j=0;j<c.length;j++){if(f=c[j],is_variable(f.value)&&'binary'==f.type&&void 0===f.size&&j<c.length-1)throw new Error('a binary field without size is only allowed at the end of a binary pattern');let a=0,i=[],k=[];if(a=getSize(f.unit,f.size),j===c.length-1?(i=g.value.slice(h),k=b.slice(h)):(i=g.value.slice(h,h+a),k=b.slice(h,h+a)),is_variable(f.value))switch(f.type){case'integer':f.attributes&&-1!=f.attributes.indexOf('signed')?d.push(new Int8Array([i[0]])[0]):d.push(new Uint8Array([i[0]])[0]);break;case'float':if(64===a)d.push(Float64Array.from(i)[0]);else if(32===a)d.push(Float32Array.from(i)[0]);else return!1;break;case'bitstring':d.push(createBitString(i));break;case'binary':d.push(e.apply(null,new Uint8Array(i)));break;case'utf8':d.push(e.apply(null,new Uint8Array(i)));break;case'utf16':d.push(e.apply(null,new Uint16Array(i)));break;case'utf32':d.push(e.apply(null,new Uint32Array(i)));break;default:return!1;}else if(!arraysEqual(i,k))return!1;h+=a}return!0}}),g.set(Number.prototype,function resolveNumber(a){return function(b){return is_number(b)&&b===a}}),g.set(Symbol.prototype,function resolveSymbol(a){return function(b){return is_symbol(b)&&b===a}}),g.set(Map.prototype,function resolveMap(a){let b=new Map;const c=Array.from(a.keys());for(let d of c)b.set(d,buildMatch(a.get(d)));return function(d,e){if(!is_map(d)||a.size>d.size)return!1;for(let a of c)if(!d.has(a)||!b.get(a)(d.get(a),e))return!1;return!0}}),g.set(Array.prototype,function resolveArray(a){const b=a.map((a)=>buildMatch(a));return function(c,d){return is_array(c)&&c.length==a.length&&c.every(function(a,e){return b[e](c[e],d)})}}),g.set(String.prototype,function resolveString(a){return function(b){return is_string(b)&&b===a}}),g.set(Boolean.prototype,function resolveBoolean(a){return function(b){return is_boolean(b)&&b===a}}),g.set(Function.prototype,function resolveFunction(a){return function(b){return is_function(b)&&b===a}}),g.set(Object.prototype,resolveObject);class MatchError extends Error{constructor(a){if(super(),'symbol'==typeof a)this.message='No match for: '+a.toString();else if(Array.isArray(a)){let b=a.map((a)=>{return null===a?'null':'undefined'==typeof a?'undefined':a.toString()});this.message='No match for: '+b}else this.message='No match for: '+a;this.stack=new Error().stack,this.name=this.constructor.name}}class Clause{constructor(a,b,c=()=>!0){this.pattern=buildMatch(a),this.arity=a.length,this.optionals=getOptionalValues(a),this.fn=b,this.guard=c}}const h=Symbol();// https://github.com/airportyh/protomorphism
class Protocol{constructor(a){function createFun(a){return function(...c){const d=c[0];let e=null;if(null===d&&this.hasImplementation(Symbol('null'))?e=this.registry.get(Symbol)[a]:b(d)&&this.hasImplementation(r.Integer)?e=this.registry.get(r.Integer)[a]:'number'==typeof d&&!b(d)&&this.hasImplementation(r.Float)?e=this.registry.get(r.Float)[a]:'string'==typeof d&&this.hasImplementation(r.BitString)?e=this.registry.get(r.BitString)[a]:d&&d instanceof Map&&d.has(Symbol.for('__struct__'))&&this.hasImplementation(d)?e=this.registry.get(d.get(Symbol.for('__struct__')).__MODULE__)[a]:null!==d&&this.hasImplementation(d)?e=this.registry.get(d.constructor)[a]:this.fallback&&(e=this.fallback[a]),null!=e){const a=e.apply(this,c);return a}throw new Error(`No implementation found for ${d}`)}}for(const b in this.registry=new Map,this.fallback=null,a)this[b]=createFun(b).bind(this)}implementation(a,b){null===a?this.fallback=b:this.registry.set(a,b)}hasImplementation(a){if(a===r.Integer||a===r.Float||a===r.BitString)return this.registry.has(a);return a&&a instanceof Map&&a.has(Symbol.for('__struct__'))?this.registry.has(a.get(Symbol.for('__struct__')).__MODULE__):this.registry.has(a.constructor)}}class Recurse{constructor(a){this.func=a}}var i={reverse,foreach:function foreach(a,b){return b.forEach((b)=>a(b)),Symbol.for('ok')},duplicate:function duplicate(a,b){const c=[];for(;c.length<a;)c.push(b);return c},flatten,foldl,foldr:function foldr(a,b,c){return foldl(a,b,reverse(c))},keydelete,keyfind,keymember:function keymember(a,b,c){return!1!==keyfind(a,b,c)},keyreplace:function keyreplace(a,b,c,d){const e=[...c];for(let f=0;f<e.length;f++)if(e[f].get(b-1)===a)return e[f]=d,e;return e},keysort:function keysort(c,a){const b=[...a];return b.sort((d,a)=>{if(d.get(c-1)<a.get(c-1))return-1;return d.get(c-1)>a.get(c-1)?1:0})},keystore:function keystore(a,b,c,d){const e=[...c];for(let f=0;f<e.length;f++)if(e[f].get(b-1)===a)return e[f]=d,e;return e.concat(d)},keytake:function keytake(a,b,c){const d=keyfind(a,b,c);return!1!==d&&new e.Tuple(d.get(b-1),d,keydelete(a,b,c))},mapfoldl:function mapfoldl(a,b,c){const d=[];let f=b;for(const e of c){const b=a(e,f);d.push(b.get(0)),f=b.get(1)}return new e.Tuple(d,f)},concat:function concat(a){return a.map((a)=>a.toString()).join()},map:function map(a,b){return b.map((b)=>a(b))},filter:function filter(a,b){return b.filter((b)=>a(b))},filtermap:function filtermap(a,b){const c=[];for(const d of b){const b=a(d);!0===b?c.push(d):b instanceof e.Tuple&&!0===b.get(0)&&c.push(b.get(1))}return c},member:function member(a,b){for(const c of b)if(c===a)return!0;return!1},all:function all(a,b){for(const c of b)if(!1===a(c))return!1;return!0},any:function any(a,b){for(const c of b)if(!0===a(c))return!0;return!1},splitwith:function splitwith(a,b){let c=!1;const d=[],f=[];for(const e of b)!0==c?f.push(e):!0===a(e)?d.push(e):(c=!0,f.push(e));return new e.Tuple(d,f)},sort:function sort(...a){if(1===a.length){const b=[...a[0]];return b.sort()}const c=a[0],b=[...a[1]];return b.sort((d,a)=>{const b=c(d,a);return!0===b?-1:1})}},j={atom_to_binary,binary_to_atom,binary_to_existing_atom:function binary_to_existing_atom(a,b=Symbol.for('utf8')){return binary_to_atom(a,b)},list_concatenation:function list_concatenation(a,b){return a.concat(b)},list_subtraction:function list_subtraction(a,b){const c=[...a];for(const d of b){const a=c.indexOf(d);-1<a&&c.splice(a,1)}return c},div:function div(a,b){return a/b},not:function not(a){return!a},rem:function rem(a,b){return a%b},band:function band(a,b){return a&b},bor:function bor(a,b){return a|b},bsl:function bsl(a,b){return a<<b},bsr:function bsr(a,b){return a>>b},bxor:function bxor(a,b){return a^b},bnot:function bnot(a){return~a},is_bitstring:is_bitstring$1,is_boolean:function is_boolean$1(a){return'boolean'==typeof a||a instanceof Boolean},is_float:function is_float(a){return is_number$1(a)&&!b(a)},is_function:function is_function$1(a){return'function'==typeof a||a instanceof Function},is_integer,is_list:function is_list(a){return Array.isArray(a)},is_map:function is_map$1(a){return a instanceof Map},is_number:is_number$1,is_pid:function is_pid(a){return a instanceof e.PID},is_port:function is_port(){return!1},is_reference:function is_reference(a){return a instanceof e.Reference},is_tuple:function is_tuple(a){return a instanceof e.Tuple},is_atom:function is_atom(a){return'symbol'==typeof a||a instanceof Symbol||a.__MODULE__},is_binary,element:function element(a,b){return b.get(a-1)},setelement:function setelement(a,b,c){const d=[...b.values];return d[a-1]=c,new e.Tuple(...d)},make_tuple:function make_tuple(a,b){const c=[];for(let d=0;d<a;d++)c.push(b);return new e.Tuple(...c)},insert_element:function insert_element(a,b,c){const d=[...b.values];return d.splice(a-1,0,c),new e.Tuple(...d)},append_element:function append_element(a,b){const c=[...a.values,b];return new e.Tuple(...c)},delete_element:function delete_element(a,b){const c=[...b.values];return c.splice(a-1,1),new e.Tuple(...c)},tuple_to_list:function tuple_to_list(a){const b=[...a.values];return b},abs:function abs(a){return Math.abs(a)},apply:function apply(...a){return 2===a.length?a[0].apply(this,...a[1]):a[0][atom_to_binary(a[1])].apply(this,...a[2])},binary_part:function binary_part(a,b,c){return a.substring(b,b+c)},bit_size:function bit_size(a){return a.bit_size},byte_size:function byte_size(a){return a.byte_size},hd:function hd(a){return a[0]},length:function length(a){return a.length},make_ref:function make_ref(){return new e.Reference},map_size:function map_size(a){return a.size},max:function max(a,b){return Math.max(a,b)},min:function min(a,b){return Math.min(a,b)},round:function round(a){return Math.round(a)},tl:function tl(a){return a.slice(1)},trunc:function trunc(a){return Math.trunc(a)},tuple_size:function tuple_size(a){return a.length},binary_to_float:function binary_to_float(a){return parseFloat(a)},binary_to_integer:function binary_to_integer(a,b=10){return parseInt(a,b)},process_info:function process_info(a,b){return b?b===Symbol.for('current_stacktrace')?new e.Tuple(b,[]):new e.Tuple(b,null):[]},iolist_to_binary,io_size:function io_size(a){return iolist_to_binary(a).length},integer_to_binary:function integer_to_binary(a,b=10){return a.toString(b)},atom_to_list:function atom_to_list(a){return Symbol.keyFor(a)}};// http://erlang.org/doc/man/maps.html
const k=Symbol.for('ok'),l=Symbol.for('error'),m=Symbol.for('badmap'),n=Symbol.for('badkey');const o=Symbol.for('elixir_config'),p=new Map;const q=function get_global(){return'undefined'==typeof self?'undefined'==typeof window?'undefined'==typeof global?(console.warn('No global state found'),null):global:window:self}();q.__elixirscript_store__=new Map,q.__elixirscript_names__=new Map;var r={Tuple:e.Tuple,PID:e.PID,BitString:e.BitString,Patterns:{defmatch:function defmatch(...a){const b=getArityMap(a);return function(...a){let[c,d]=findMatchingFunction(a,b);return c.apply(this,d)}},match:function match(a,b,c=()=>!0){let d=[],e=buildMatch(a);const f=e(b,d),[g,h]=checkNamedVariables(d);if(f&&h&&c.apply(this,g))return g;throw console.error('No match for:',b),new MatchError(b)},MatchError,variable:function variable(a=null,b=Symbol.for('tailored.no_value')){return new Variable(a,b)},wildcard:function wildcard(){return new Wildcard},startsWith:function startsWith(a){return new StartsWith(a)},capture:function capture(a){return new Capture(a)},headTail:function headTail(a,b){return new HeadTail(a,b)},type:function a(a,b={}){return new Type(a,b)},bound:function bound(a){return new Bound(a)},Clause,clause:function clause(a,b,c=()=>!0){return new Clause(a,b,c)},bitStringMatch:function bitStringMatch(...a){return new BitStringMatch(...a)},match_or_default,defmatchgen,list_comprehension:function list_comprehension(a,b){const c=run_generators(b.pop()(),b);let d=[];for(let e of c)a.guard.apply(this,e)&&d.push(a.fn.apply(this,e));return d},list_generator:function list_generator(a,b){return function(){let c=[];for(let d of b){const b=match_or_default(a,d,()=>!0,h);if(b!=h){const[a]=b;c.push(a)}}return c}},bitstring_generator:function bitstring_generator(a,b){return function(){let c=[],d=b.slice(0,a.byte_size()),e=1;for(;d.byte_size==a.byte_size();){const f=match_or_default(a,d,()=>!0,h);if(f!=h){c.push(f)}d=b.slice(a.byte_size()*e,a.byte_size()*(e+1)),e++}return c}},bitstring_comprehension:function bitstring_comprehension(a,b){const c=run_generators(b.pop()(),b);let d=[];for(let e of c)a.guard.apply(this,e)&&d.push(a.fn.apply(this,e));return d=d.map((a)=>e.BitString.integer(a)),new e.BitString(...d)},defmatchGen:function defmatchGen(...a){return defmatchgen(...a)},defmatchAsync:function defmatchAsync(...a){const b=getArityMap(a);return async function(...a){if(b.has(a.length)){const c=b.get(a.length);let d=null,e=null;for(let b of c){let c=[];a=fillInOptionalValues(a,b.arity,b.optionals);const f=b.pattern(a,c),[g,h]=checkNamedVariables(c);if(f&&h&&(await b.guard.apply(this,c))){d=b.fn,e=c;break}}if(!d)throw console.error('No match for:',a),new MatchError(a);return d.apply(this,e)}throw console.error('Arity of',a.length,'not found. No match for:',a),new MatchError(a)}}},Integer:class Integer{},Float:class Float{},Functions:{call_property:function call_property(a,b){if(!b)return a instanceof Function||'function'==typeof a?a():a;if(a instanceof Map){let c=null;if(a.has(b)?c=b:a.has(Symbol.for(b))&&(c=Symbol.for(b)),null===c)throw new Error(`Property ${b} not found in ${a}`);return a.get(c)instanceof Function||'function'==typeof a.get(c)?a.get(c)():a.get(c)}let c=null;if('number'==typeof a||'symbol'==typeof a||'boolean'==typeof a||'string'==typeof a?void 0===a[b]?void 0!==a[Symbol.for(b)]&&(c=Symbol.for(b)):c=b:b in a?c=b:Symbol.for(b)in a&&(c=Symbol.for(b)),null===c)throw new Error(`Property ${b} not found in ${a}`);return a[c]instanceof Function||'function'==typeof a[c]?a[c]():a[c]},defprotocol:function defprotocol(a){return new Protocol(a)},defimpl:function defimpl(a,b,c){a.implementation(b,c)},build_namespace:function build_namespace(a,b){let c=b.split('.');const d=a;let e=a;'Elixir'===c[0]&&(c=c.slice(1));for(const d of c)'undefined'==typeof e[d]&&(e[d]={}),e=e[d];return d.__table__=a.__table__||{},d.__table__[Symbol.for(b)]=e,e},iterator_to_reducer,map_to_object,trampoline:function trampoline$1(a){let b=a;for(;b&&b instanceof Recurse;)b=b.func();return b},Recurse},SpecialForms:{_case:function _case(a,b){return r.Patterns.defmatch(...b)(a)},cond:function cond(...a){for(const b of a)if(b[0])return b[1]();throw new Error},_for:function _for(a,b,c,d=[]){let[e,f]=c.into(d);const g=run_list_generators(b.pop()(),b);for(const h of g)a.guard.apply(this,h)&&(e=f(e,new r.Tuple(Symbol.for('cont'),a.fn.apply(this,h))));return f(e,Symbol.for('done'))},_try:function _try(a,b,c,d,e){let f=null;try{f=a()}catch(a){let d=null;if(b)try{return d=b(a),d}catch(a){if(a instanceof r.Patterns.MatchError)throw a}if(c)try{return d=c(a),d}catch(a){if(a instanceof r.Patterns.MatchError)throw a}throw a}finally{e&&e()}if(d)try{return d(f)}catch(a){if(a instanceof r.Patterns.MatchError)throw new Error('No Match Found in Else');throw a}else return f},_with:function _with(...a){let b=[],c=null,d=null;'function'==typeof a[a.length-2]?[c,d]=a.splice(-2):c=a.pop();for(let c=0;c<a.length;c++){const[e,f]=a[c],g=f(...b),h=r.Patterns.match_or_default(e,g);if(null==h)return d?d.call(null,g):g;b=b.concat(h)}return c(...b)},receive:function receive(){console.warn('Receive not supported')}},Store:{create:function create(a,b=null){const c=new r.PID;return null!==b&&__elixirscript_names__.set(b,c),__elixirscript_store__.set(c,a)},update:function update$2(a,b){const c=get_key(a);return __elixirscript_store__.set(c,b)},read:function read(a){const b=get_key(a);return __elixirscript_store__.get(b)},remove:function remove$1(a){const b=get_key(a);return __elixirscript_store__.delete(b)}},global:q,erlang:j,maps:{find:function find(a,b){if(!1===j.is_map(b))return new e.Tuple(m,b);const c=b.get(a);return'undefined'==typeof c?l:new e.Tuple(k,c)},fold:function fold(a,b,c){let d=b;for(const[e,f]of c.entries())d=a(e,f,d);return d},remove:function remove(a,b){if(!1===j.is_map(b))return new e.Tuple(m,b);const c=new Map(b);return c.delete(a),c},to_list:function to_list(a){if(!1===j.is_map(a))return new e.Tuple(m,a);const b=[];for(const[c,d]of a.entries())b.push(new e.Tuple(c,d));return b},from_list:function from_list(a){return a.reduce((a,b)=>{const[c,d]=b;return a.set(c,d),a},new Map)},keys:function keys(a){return!1===j.is_map(a)?new e.Tuple(m,a):Array.from(a.keys())},values:function values$1(a){return!1===j.is_map(a)?new e.Tuple(m,a):Array.from(a.values())},is_key,put:function put(a,b,c){if(!1===j.is_map(c))return new e.Tuple(m,c);const d=new Map(c);return d.set(a,b),d},merge:function merge(a,b){return!1===j.is_map(a)?new e.Tuple(m,a):!1===j.is_map(b)?new e.Tuple(m,b):new Map([...a,...b])},update:function update(a,b,c){return!1===j.is_map(c)?new e.Tuple(m,c):!1===is_key(a,c)?new e.Tuple(n,a):new Map([...c,[a,b]])},get:function get(...a){const b=a[0],c=a[1];return!1===j.is_map(c)?new e.Tuple(m,c):is_key(b)?c.get(b):3===a.length?a[2]:new e.Tuple(n,b)},take:function take(a,b){if(!1===j.is_map(b))return new e.Tuple(m,b);if(!is_key(a))return l;const c=b.get(a),d=new Map(b);return d.delete(a),new e.Tuple(c,d)}},lists:i,elixir_errors:{warn:function warn(a){const b=a.join('');return console.warn(`warning: ${b}`),Symbol.for('ok')}},io:{put_chars:function put_chars(a,b){const c=j.iolist_to_binary(b);return a===Symbol.for('stderr')?console.error(c):console.log(c),Symbol.for('ok')}},binary:{copy:function copy(a,b=1){return a.repeat(b)}},unicode:{characters_to_list:function characters_to_list(a){return a.split('').map((a)=>a.codePointAt(0))},characters_to_binary:function characters_to_binary(b){return j.is_binary(b)?b:a(...b)}},elixir_config:{new:function _new(a){return p.set(o,new Map),p.get(o).set(o,a),o},delete:function _delete(a){return p.delete(a),!0},put:put$1,get:get$1,update:function update$1(a,b){const c=b(p.get(o).get(a));return put$1(a,c),c},get_and_put:function get_and_put(a,b){const c=get$1(a);return put$1(a,b),c}}};return{Core:r}}();
