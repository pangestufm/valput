const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const file='C3-Persetujuan-Caput-v0.1.3.zip';

test('satu tombol footer membuka dua pilihan unduhan native Chrome dan Firefox',()=>{
    const summaries=[...html.matchAll(/<summary\b[^>]*id="kppnExtensionDownload"[^>]*>[\s\S]*?<\/summary>/g)];
    assert.equal(summaries.length,1,'Tombol pilihan harus tersedia tepat satu kali');
    assert.match(summaries[0][0],/Khusus KPPN - Validator Caput/);
    assert.match(summaries[0][0],/aria-describedby="extensionDownloadNote"/);
    const picker=html.match(/<details\b[^>]*class="extension-picker"[^>]*>([\s\S]*?)<\/details>/)?.[0];
    assert.ok(picker);assert.equal(/<details[^>]*\bopen\b/.test(picker),false);
    for(const [id,name] of [['kppnChromeDownload',file],['kppnFirefoxDownload','C3-Persetujuan-Caput-Firefox-v0.1.3.zip']]){
        const anchor=picker.match(new RegExp(`<a\\b[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/a>`))?.[0];
        assert.ok(anchor);assert.ok(anchor.includes(`href="downloads/${name}"`));assert.ok(anchor.includes(`download="${name}"`));
    }
    assert.match(picker,/sementara/i);assert.match(picker,/about:debugging/);
    assert.match(html,/<footer\b[^>]*>[\s\S]*?id="kppnExtensionDownload"[\s\S]*?<\/footer>/);
});

test('target unduhan adalah ZIP nyata dengan ukuran wajar, bukan halaman fallback',()=>{
    const data=fs.readFileSync(path.join(root,'downloads',file));
    assert.equal(data.readUInt32LE(0),0x04034b50);
    assert.ok(data.length>10000&&data.length<100000,'Paket hanya berisi runtime dan README');
});

test('paket Firefox adalah ZIP terpisah, bukan salinan paket Chrome',()=>{
    const data=fs.readFileSync(path.join(root,'downloads','C3-Persetujuan-Caput-Firefox-v0.1.3.zip'));
    assert.equal(data.readUInt32LE(0),0x04034b50);assert.ok(data.length>10000&&data.length<100000);
    assert.notDeepEqual(data,fs.readFileSync(path.join(root,'downloads',file)));
});
