const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require('C:/Users/Ando/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),file='C3-Persetujuan-Caput-v0.1.3.zip';
const baseline=execFileSync('git',['show','309b884:index.html'],{cwd:root,encoding:'utf8'});
const current=fs.readFileSync(path.join(root,'index.html'),'utf8');
const inline=html=>[...html.replace(/\r\n/g,'\n').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.deepEqual(inline(current),inline(baseline),'Mesin validator tidak boleh berubah');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const expectedHash=hash(fs.readFileSync(path.join(root,'downloads',file)));
const server=http.createServer((req,res)=>{
    const name=new URL(req.url,'http://localhost').pathname;
    if(name==='/baseline'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(baseline);return;}
    const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return;}
    const type={'.html':'text/html; charset=utf-8','.js':'text/javascript','.zip':'application/zip'}[path.extname(target)]||'application/octet-stream';
    res.setHeader('Content-Type',type);res.end(fs.readFileSync(target));
});
(async()=>{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const url=`http://127.0.0.1:${server.address().port}`;
    const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    try{
        const context=await browser.newContext({reducedMotion:'reduce'});
        await context.route('https://cdnjs.cloudflare.com/ajax/libs/xlsx/**',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'.qa/xlsx.cjs'),'utf8')}));
        await context.route('https://cloud.umami.is/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
        const page=await context.newPage(),before=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const geometry=p=>p.evaluate(()=>['.hero','.header','.upload-section'].map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {selector,x:r.x,width:r.width,height:r.height};}));
        for(const width of [390,768,1440]){
            await page.setViewportSize({width,height:900});await before.setViewportSize({width,height:900});
            await page.goto(url,{waitUntil:'networkidle'});await before.goto(url+'/baseline',{waitUntil:'networkidle'});
            for(const theme of ['light','dark']){
                for(const p of [page,before])await p.evaluate(value=>{if((document.documentElement.dataset.theme||'light')!==value)toggleTheme();},theme);
                const old=await geometry(before),now=await geometry(page);
                for(let i=0;i<old.length;i++)for(const key of ['x','width','height'])assert.ok(Math.abs(old[i][key]-now[i][key])<1,`${width}/${theme} layout ${old[i].selector}.${key} berubah`);
                assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}/${theme} overflow`);
                const link=page.locator('#kppnExtensionDownload');await link.scrollIntoViewIfNeeded();await link.focus();
                assert.equal(await page.evaluate(()=>document.activeElement.id),'kppnExtensionDownload');
                const contrast=await link.evaluate(el=>{
                    const s=getComputedStyle(el),lum=value=>{const v=value.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>(x/=255)<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];};
                    const a=lum(s.color),b=lum(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
                });
                assert.ok(contrast>=4.5,`${theme} contrast ${contrast}`);
                await page.locator('.extension-picker').evaluate(el=>el.open=false);
                await page.locator('.container').screenshot({path:path.join(root,`.qa/browser-choice-${width}-${theme}-closed.png`)});
                await link.press('Enter');assert.equal(await page.locator('.extension-picker').getAttribute('open'),'');
                await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'kppnChromeDownload');
                await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'kppnFirefoxDownload');
                const help=page.locator('.firefox-help');assert.equal(await help.getAttribute('open'),null);
                await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Cara pasang Firefox');
                await page.keyboard.press('Enter');assert.equal(await help.getAttribute('open'),'');
                assert.equal(await page.locator('#firefoxInstallNote ol').isVisible(),true);
                await page.keyboard.press('Enter');assert.equal(await help.getAttribute('open'),null);
                assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}/${theme} open overflow`);
                await page.locator('.container').screenshot({path:path.join(root,`.qa/browser-choice-${width}-${theme}-open.png`)});
                await link.focus();await link.press('Space');assert.equal(await page.locator('.extension-picker').getAttribute('open'),null);
                await link.press('Enter');
            }
        }
        for(const [id,name] of [['kppnChromeDownload',file],['kppnFirefoxDownload','C3-Persetujuan-Caput-Firefox-v0.1.3.zip']]){
            const event=page.waitForEvent('download');await page.locator('#'+id).click();const download=await event;
            assert.equal(download.suggestedFilename(),name);assert.equal(await download.failure(),null);
            assert.equal(hash(fs.readFileSync(await download.path())),hash(fs.readFileSync(path.join(root,'downloads',name))));
        }
        await page.locator('#excelFileInput').setInputFiles(path.join(root,'.qa/kertas-kerja-uji.xlsx'));
        await page.locator('#processButton').click();await page.waitForFunction(()=>document.getElementById('countTotal').textContent==='2');
        const exportEvent=page.waitForEvent('download');await page.locator('#exportButton').click();const exported=await exportEvent;assert.equal(await exported.failure(),null);
        await page.locator('#excelFileInput').setInputFiles(path.join(root,'.qa/format-salah.xlsx'));await page.locator('#processButton').click();
        await page.waitForFunction(()=>document.getElementById('uploadNotification').textContent.includes('format salah'));
        assert.deepEqual(errors,[]);
        console.log('PASS: layout hero/header/upload identik; 390/768/1440 light/dark, disclosure closed/open tanpa overflow; Enter/Space/Tab dan kontras; kedua ZIP hash cocok; upload-validasi-export dan notif format salah; tanpa pageerror.');
    }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
