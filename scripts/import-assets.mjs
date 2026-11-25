// Import original asset pack from an extracted folder (never import its .git or overwrite source).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=process.argv[2]&&path.resolve(process.argv[2]);
if(!src||!fs.existsSync(path.join(src,'assets')))throw new Error('Usage: node scripts/import-assets.mjs /path/to/extracted/pov-adventure-park-assets');
const rootAssets=path.join(root,'assets'),sourceAssets=path.join(src,'assets');
if(rootAssets===sourceAssets)throw new Error('Choose a separate extracted folder');
const manifestPath=path.join(src,'manifest.json');
if(!fs.existsSync(manifestPath)||!fs.existsSync(path.join(src,'level-assets.json')))throw new Error('Expected original asset manifest and level-assets.json');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):x.isFile()?[path.join(d,x.name)]:[]);
const files=walk(sourceAssets);
for(const f of files){const rel=path.relative(sourceAssets,f);if(!/\.(webp|glb|wav|json)$/i.test(rel))throw new Error('Unexpected asset '+rel)}
const inventory=files.map(f=>({path:path.relative(src,f).split(path.sep).join('/'),sha256:createHash('sha256').update(fs.readFileSync(f)).digest('hex')}));
for(const f of files){const dest=path.join(rootAssets,path.relative(sourceAssets,f));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(f,dest)}
for(const f of ['manifest.json','level-assets.json','preview.webp'])if(fs.existsSync(path.join(src,f)))fs.copyFileSync(path.join(src,f),path.join(root,f));
for(const [from,to] of [['feet.webp','feet.webp'],['raft_rim.webp','raft.webp'],['coaster_front.webp','coaster.webp']]){const p=path.join(sourceAssets,'sprites/pov',from);if(fs.existsSync(p)){fs.mkdirSync(path.join(rootAssets,'prototype'),{recursive:true});fs.copyFileSync(p,path.join(rootAssets,'prototype',to));}}
fs.writeFileSync(path.join(root,'qa/imported-assets.json'),JSON.stringify(inventory,null,2)+'\n');
console.log('Imported',files.length,'original files. Review git status/diff before commit. Source not overwritten.');
