import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const arg=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
const {chromium}=await import(pathToFileURL(arg('playwright')));
const out=path.resolve(arg('out'));await fs.mkdir(out,{recursive:true});
const records=[];
for(const viewport of [{width:1400,height:900},{width:393,height:852}]){
 let browser;const record={viewport,ok:false};
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(arg('base'));await page.locator('#status').filter({hasText:'Validated:100'.replace(':',': ')}).waitFor();
  assert.equal(await page.locator('#build option').count(),100);
  await page.locator('#build').selectOption('ATLAS-41');await page.locator('#title').filter({hasText:'Metals source adapter'}).waitFor();
  assert.match(await page.locator('#relations').innerText(),/migration_source/);
  await page.locator('summary').click();assert.match(await page.locator('#detail').innerText(),/blocked_pending_dependency_audit/);
  await page.screenshot({path:path.join(out,`plan-${viewport.width}.png`),fullPage:true});
  assert.deepEqual(errors,[]);record.relations=await page.locator('#relations li').count();
  await page.route('**/data/nodes.json',async route=>{const r=await route.fetch();const d=await r.json();d.features.pop();await route.fulfill({json:d});});
  await page.reload();await page.locator('#status').filter({hasText:'Plan refused:'}).waitFor();record.tamperedGraphRefused=true;record.ok=true;
 }catch(e){record.error=String(e);process.exitCode=1;}finally{await browser?.close();records.push(record);}
}
await fs.writeFile(path.join(out,'results.json'),JSON.stringify({scope:'Real Chrome viewer interaction and tampered graph refusal; viewport emulation, not physical devices',records},null,2)+'\n');console.log(JSON.stringify(records));
