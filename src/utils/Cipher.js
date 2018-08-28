import CryptoJS from './tripledes'
import './mode-ecb';

function encryptByDESModeEBC(message) {
	var key = createUuid(32, 16);
	//  var key = "01234567890123456789012345678901"
	//	console.log(key);
	//	console.log(message)
	var keyHex = CryptoJS.enc.Utf8.parse(key);
	var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});
	return encrypted.ciphertext.toString() + key;
}

function decryptByDESModeEBC(text) {
	var key = text.substr(text.length - 32);
	var ciphertext = text.slice(0, -32)
	var keyHex = CryptoJS.enc.Utf8.parse(key);
	var decrypted = CryptoJS.DES.decrypt({
		ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
	}, keyHex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});
	var result_value = decrypted.toString(CryptoJS.enc.Utf8);
	return result_value;
}

function createUuid(len, radix) {
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	var uuid = [],
		i;
	radix = radix || chars.length;

	if(len) {
		// Compact form
		for(i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
	} else {
		// rfc4122, version 4 form
		var r;

		// rfc4122 requires these characters
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';

		// Fill in random data.  At i==19 set the high bits of clock sequence as
		// per rfc4122, sec. 4.1.5
		for(i = 0; i < 36; i++) {
			if(!uuid[i]) {
				r = 0 | Math.random() * 16;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
	}

	return uuid.join('');
}

export function Request(_this, url, param, msg) {
	param = Object.assign(param, {
		customId: _this.$store.state.user.customId,
		sysVer: '30',
		platform: 'android',
		client: 'admin',
		adminId: _this.$store.state.user.adminId
	});
	return _this.$http.post(url, {
		param: encryptByDESModeEBC(JSON.stringify(param))
	}, {
		emulateJSON: true,
		msg: msg
	})
}

export function Response(msg) {
	return decryptByDESModeEBC(msg)
}