/* tslint:disable */
import { ObjectSize as __O, Struct as __S } from 'capnp-ts';
export const _capnpFileId = "93eca3fe49376df5";
export class Seal extends __S {
    adoptSignature(value) { __S.adopt(value, __S.getPointer(0, this)); }
    disownSignature() { return __S.disown(this.getSignature()); }
    getSignature() { return __S.getData(0, this); }
    hasSignature() { return !__S.isNull(__S.getPointer(0, this)); }
    initSignature(length) { return __S.initData(0, length, this); }
    setSignature(value) { __S.copyFrom(value, __S.getPointer(0, this)); }
    adoptVerifyingKey(value) { __S.adopt(value, __S.getPointer(1, this)); }
    disownVerifyingKey() { return __S.disown(this.getVerifyingKey()); }
    getVerifyingKey() { return __S.getData(1, this); }
    hasVerifyingKey() { return !__S.isNull(__S.getPointer(1, this)); }
    initVerifyingKey(length) { return __S.initData(1, length, this); }
    setVerifyingKey(value) { __S.copyFrom(value, __S.getPointer(1, this)); }
    toString() { return "Seal_" + super.toString(); }
}
Seal._capnp = { displayName: "Seal", id: "c26ae0f7e8198ed1", size: new __O(0, 2) };
export class MessageMeta extends __S {
    getType() { return __S.getUint16(0, this); }
    setType(value) { __S.setUint16(0, value, this); }
    getUuid() { return __S.getUint32(4, this); }
    setUuid(value) { __S.setUint32(4, value, this); }
    getTimestamp() { return __S.getText(0, this); }
    setTimestamp(value) { __S.setText(0, value, this); }
    getSender() { return __S.getText(1, this); }
    setSender(value) { __S.setText(1, value, this); }
    toString() { return "MessageMeta_" + super.toString(); }
}
MessageMeta._capnp = { displayName: "MessageMeta", id: "ac093d7a9a2a041e", size: new __O(8, 2) };
export class Envelope extends __S {
    adoptSeal(value) { __S.adopt(value, __S.getPointer(0, this)); }
    disownSeal() { return __S.disown(this.getSeal()); }
    getSeal() { return __S.getStruct(0, Seal, this); }
    hasSeal() { return !__S.isNull(__S.getPointer(0, this)); }
    initSeal() { return __S.initStructAt(0, Seal, this); }
    setSeal(value) { __S.copyFrom(value, __S.getPointer(0, this)); }
    adoptMeta(value) { __S.adopt(value, __S.getPointer(1, this)); }
    disownMeta() { return __S.disown(this.getMeta()); }
    getMeta() { return __S.getStruct(1, MessageMeta, this); }
    hasMeta() { return !__S.isNull(__S.getPointer(1, this)); }
    initMeta() { return __S.initStructAt(1, MessageMeta, this); }
    setMeta(value) { __S.copyFrom(value, __S.getPointer(1, this)); }
    adoptMessage(value) { __S.adopt(value, __S.getPointer(2, this)); }
    disownMessage() { return __S.disown(this.getMessage()); }
    getMessage() { return __S.getData(2, this); }
    hasMessage() { return !__S.isNull(__S.getPointer(2, this)); }
    initMessage(length) { return __S.initData(2, length, this); }
    setMessage(value) { __S.copyFrom(value, __S.getPointer(2, this)); }
    toString() { return "Envelope_" + super.toString(); }
}
Envelope._capnp = { displayName: "Envelope", id: "ec5602978d00d39b", size: new __O(0, 3) };
