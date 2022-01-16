extractCMS
==========

CMS (PKCS#7) SignedData extraction functions.
Does support DER, PEM and bare Base64 input.
Does support constructed content (often used to create signatures in a stream).

NodeJS usage
------------

Install with `npm install --save @lapo/extractcms`, use like this:

    const
        fs = require('fs'),
        CMS = require('@lapo/extractcms'),
        envelope = fs.readFileSync(process.argv[2]),
        content = CMS.extract(envelope);
    console.log('Content length: ' + content.length);

ISC license
-----------

CMS (PKCS#7) SignedData extraction Copyright (c) 2018-2022 Lapo Luchini <lapo@lapo.it>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
