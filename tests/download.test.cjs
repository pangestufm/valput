const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const file='C3-Persetujuan-Caput-v0.1.3.zip';

test('satu tombol khusus KPPN mengunduh paket Chrome terbaru dari footer',()=>{
    const anchors=[...html.matchAll(/<a\b[^>]*id="kppnExtensionDownload"[^>]*>[\s\S]*?<\/a>/g)];
    assert.equal(anchors.length,1,'Tombol unduh harus tersedia tepat satu kali');
    const anchor=anchors[0][0];
    assert.match(anchor,/Khusus KPPN - Validator Caput/);
    assert.ok(anchor.includes(`href="downloads/${file}"`));
    assert.ok(anchor.includes(`download="${file}"`));
    assert.match(anchor,/aria-describedby="extensionDownloadNote"/);
    assert.match(html,/<footer\b[^>]*>[\s\S]*?id="kppnExtensionDownload"[\s\S]*?<\/footer>/);
    assert.match(html,/id="extensionDownloadNote"[^>]*>[\s\S]*?Chrome \/ Edge[\s\S]*?v0\.1\.3/);
});

test('target unduhan adalah ZIP nyata dengan ukuran wajar, bukan halaman fallback',()=>{
    const data=fs.readFileSync(path.join(root,'downloads',file));
    assert.equal(data.readUInt32LE(0),0x04034b50);
    assert.ok(data.length>10000&&data.length<100000,'Paket hanya berisi runtime dan README');
});
