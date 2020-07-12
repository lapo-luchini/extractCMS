// CMS (PKCS#7) SignedData extraction
// Copyright (c) 2018-2020 Lapo Luchini <lapo@lapo.it>

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

const ASN1 = require('@lapo/asn1js');

function parseTypedData(asn1, oid, prefix) {
    if (asn1.typeName() != 'SEQUENCE')
        throw new Error(prefix + ' is not a DER SEQUENCE.');
    if (asn1.sub.length != 2)
        throw new Error(prefix + ' is not a DER SEQUENCE of length 2.');
    const type = asn1.sub[0];
    if (!type || type.typeName() != 'OBJECT_IDENTIFIER')
        throw new Error(prefix + ' is missing ContentType OID.');
    const actualOID = type.content().split(/\n/, 1)[0]; //TODO: add "machine-oriented" content representation
    if (actualOID != oid)
        throw new Error(prefix + ' has wrong ContentType: ' + actualOID + ' instead of ' + oid);
    return asn1.sub[1];
}

function parseOctetString(asn1, prefix) {
    if (asn1.typeName() != 'OCTET_STRING')
        throw new Error(prefix + ' is not a DER OCTET_STRING.');
    if (!asn1.tag.tagConstructed)
        return asn1.stream.enc.slice(asn1.posContent(), asn1.posEnd());
    const buf = asn1.sub.map(function (o, i) {
        return parseOctetString(o, prefix + '[' + i + ']');
    });
    return Buffer.concat(buf);
}

function parseCMS(data) {
    if (data[0] != 0x30) { // doesn't seem to be ASN.1 DER SEQUENCE
        let b64 = data.toString('ascii');
        // if PEM delimiter is found, keep only content
        const header = '-----BEGIN PKCS7-----';
        let idx = data.indexOf(header);
        if (idx >= 0) {
            const idx1 = idx + header.length;
            const idx2 = data.indexOf('-----END PKCS7-----', idx1);
            b64 = b64.slice(idx1, idx2);
        }
        // try Base64 on result
        data = Buffer.from(b64, 'base64');
    }
    try {
        return ASN1.decode(data);
    } catch (e) {
        throw new Error('Could not decode ASN.1 structure.');
    }
}

function CMS(data) {
    this.contentInfo = parseCMS(data);
}

CMS.prototype.extract = function () {
    const signedData = parseTypedData(this.contentInfo, '1.2.840.113549.1.7.2', 'ContentInfo').sub[0]; // https://tools.ietf.org/html/rfc5652#section-5.1
    if (signedData.typeName() != 'SEQUENCE')
        throw new Error('SignedData is not a DER SEQUENCE.');
    const encapContentInfo = signedData.sub[2]; // https://tools.ietf.org/html/rfc5652#section-5.1
    const eContent = parseTypedData(encapContentInfo, '1.2.840.113549.1.7.1', 'EncapsulatedContentInfo');
    const content = eContent.sub[0]; // https://tools.ietf.org/html/rfc5652#section-5.2
    return parseOctetString(content);
};

// utility methods to keep retro-compatibility

CMS.parse = function (data) {
    return new CMS(data).contentInfo;
};

CMS.extract = function (data) {
    return new CMS(data).extract();
}

module.exports = CMS;
