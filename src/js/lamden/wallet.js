import * as nacl from 'tweetnacl';
import * as helpers from './helpers';
/**
 * @param Uint8Array(length: 32) seed
 *      seed:   A Uint8Array with a length of 32 to seed the keyPair with. This is advanced behavior and should be
 *              avoided by everyday users
 *
 * @return {Uint8Array(length: 32), Uint8Array(length: 32)} { vk, sk }
 *      sk:     Signing Key (SK) represents 32 byte signing key
 *      vk:     Verify Key (VK) represents a 32 byte verify key
 */
export function generate_keys(seed = null) {
    var kp = null;
    if (seed == null) {
        kp = nacl.sign.keyPair();
    }
    else {
        kp = nacl.sign.keyPair.fromSeed(seed);
    }
    // In the JS implementation of the NaCL library the sk is the first 32 bytes of the secretKey
    // and the vk is the last 32 bytes of the secretKey as well as the publicKey
    // {
    //   'publicKey': <vk>,
    //   'secretKey': <sk><vk>
    // }
    return {
        sk: new Uint8Array(kp['secretKey'].slice(0, 32)),
        vk: new Uint8Array(kp['secretKey'].slice(32, 64))
    };
}
/**
 * @param String sk
 *      sk:     A 64 character long hex representation of a signing key (private key)
 *
 * @return String vk
 *      vk:     A 64 character long hex representation of a verify key (public key)
 */
export function get_vk(sk) {
    var kp = format_to_keys(sk);
    var kpf = keys_to_format(kp);
    return kpf.vk;
}
/**
 * @param String sk
 *      sk:     A 64 character long hex representation of a signing key (private key)
 *
 * @return {Uint8Array(length: 32), Uint8Array(length: 32)} { vk, sk }
 *      sk:     Signing Key (SK) represents 32 byte signing key
 *      vk:     Verify Key (VK) represents a 32 byte verify key
 */
export function format_to_keys(sk) {
    var skf = helpers.hex2buf(sk);
    var kp = generate_keys(skf);
    return kp;
}
/**
 * @param Object kp
 *      kp:     Object containing the properties sk and vk
 *          sk:     Signing Key (SK) represents 32 byte signing key
 *          vk:     Verify Key (VK) represents a 32 byte verify key
 *
 * @return {string, string} { sk, vk }
 *      sk:     Signing Key (SK) represented as a 64 character hex string
 *      vk:     Verify Key (VK) represented as a 64 character hex string
 */
export function keys_to_format(kp) {
    return {
        vk: helpers.buf2hex(kp.vk),
        sk: helpers.buf2hex(kp.sk)
    };
}
/**
 * @param Uint8Array(length: 32) seed
 *      seed:   A Uint8Array with a length of 32 to seed the keyPair with. This is advanced behavior and should be
 *              avoided by everyday users
 *
 * @return {string, string} { sk, vk }
 *      sk:     Signing Key (SK) represented as a 64 character hex string
 *      vk:     Verify Key (VK) represented as a 64 character hex string
 */
export function new_wallet(seed = null) {
    const keys = generate_keys(seed);
    return keys_to_format(keys);
}
/**
 * @param String sk
 * @param Uint8Array msg
 *      sk:     A 64 character long hex representation of a signing key (private key)
 *      msg:    A Uint8Array of bytes representing the message you would like to sign
 *
 * @return String sig
 *      sig:    A 128 character long hex string representing the message's signature
 */
export function sign(sk, msg) {
    var kp = format_to_keys(sk);
    // This is required due to the secretKey required to sign a transaction
    // in the js implementation of NaCL being the combination of the sk and
    // vk for some stupid reason. That being said, we still want the sk and
    // vk objects to exist in 32-byte string format (same as cilantro's
    // python implementation) when presented to the user.
    var jsnacl_sk = helpers.concatUint8Arrays(kp.sk, kp.vk);
    return helpers.buf2hex(nacl.sign.detached(msg, jsnacl_sk));
}
/**
 * @param String vk
 * @param Uint8Array msg
 * @param String sig
 *      vk:     A 64 character long hex representation of a verify key (public key)
 *      msg:    A Uint8Array (bytes) representation of a message that has been signed
 *      sig:    A 128 character long hex representation of a nacl signature
 *
 * @return Bool result
 *      result: true if verify checked out, false if not
 */
export function verify(vk, msg, sig) {
    var vkb = helpers.hex2buf(vk);
    var sigb = helpers.hex2buf(sig);
    try {
        return nacl.sign.detached.verify(msg, sigb, vkb);
    }
    catch (_a) {
        return false;
    }
}
