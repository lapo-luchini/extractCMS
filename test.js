#!/usr/bin/env node
'use strict';

const
    fs = require('fs'),
    CMS = require('./cms.js'),
    formats = [null /*raw buffer*/, 'binary', 'ascii'],
    files = ['sig-p256-der.p7m', 'sig-p256-ber.p7m'],
    expected = 'Inizio contenuto.\n' + 'A'.repeat(10000) + '\nFine contenuto.';

let
    run = 0,
    error = 0;
formats.forEach(format => {
    files.forEach(file => {
        let result;
        try {
            let content = fs.readFileSync('examples/' + file, { encoding: format });
            result = CMS.extract(content).toString();
        } catch (e) {
            result = 'Exception:\n' + e;
        }
        ++run;
        if (result == expected)
            console.log('\x1B[1m\x1B[32mOK \x1B[39m\x1B[22m ' + file + ' ' + format);
        else {
            ++error;
            console.log('\x1B[1m\x1B[31mERR\x1B[39m\x1B[22m ' + file + ' ' + format + '\n' + result);
        }
    });
});
console.log('Errors: ' + error + '/' + run + '.');
process.exit(error ? 1 : 0);
