exports.buf2hex = (buffer) => { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

exports.hex2buf = (hexString) => {
    var bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    return bytes;
}

exports.str2buf = (string) => {
    var buf = new Buffer.from(string);
    return new Uint8Array(buf);
}

exports.concatUint8Arrays = (array1, array2) => {
    var arr = new Uint8Array(array1.length + array2.length);
    arr.set(array1);
    arr.set(array2, array1.length);
    return arr;
}

exports.ab2str = (buf) => {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

exports.str2ab = (str) => {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

exports.str2hex = (str) => {
	var hex = '';
	for(var i=0;i<str.length;i++) {
		hex += ''+str.charCodeAt(i).toString(16);
	}
	return hex;
}

exports.hex2str = (hexx) => {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

exports.randomString = (length) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
