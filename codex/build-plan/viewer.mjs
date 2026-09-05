import {compilePlan} from './federation.mjs';
const $=id=>document.getElementById(id);
try{
 const response=await fetch('./master-plan.geojson');if(!response.ok)throw Error(`Plan HTTP ${response.status}`);
 const plan=await response.json(),graph=compilePlan(plan),nodes=graph.nodes.features,edges=graph.edges.edges;
 for(const f of plan.features){const o=document.createElement('option');o.value=f.id;o.textContent=`${f.id} — ${f.properties.title}`;$('build').append(o);}
 $('status').textContent=`Validated: ${plan.features.length} builds, ${nodes.length} nodes, ${edges.length} unique relationships. All builds planned. Revision ${plan.metadata.revision}.`;
 const svgNS='http://www.w3.org/2000/svg';
 function svg(name,attrs,text){const e=document.createElementNS(svgNS,name);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;$('graph').append(e);return e;}
 function draw(){
  const id=$('build').value,f=plan.features.find(f=>f.id===id),index=nodes.findIndex(n=>n.id==='build:'+id);
  const related=edges.filter(e=>e[0]===index||e[1]===index);$('graph').replaceChildren();$('relations').replaceChildren();
  const neighbors=[...new Set(related.map(e=>e[0]===index?e[1]:e[0]))];
  const positions=new Map([[index,[550,220]]]);neighbors.forEach((n,i)=>{const a=i*2*Math.PI/neighbors.length;positions.set(n,[550+385*Math.cos(a),220+170*Math.sin(a)]);});
  for(const e of related){const [a,b]=[positions.get(e[0]),positions.get(e[1])];svg('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1]});const li=document.createElement('li');li.textContent=`${nodes[e[0]].properties.label} → ${e[2]} → ${nodes[e[1]].properties.label}`;$('relations').append(li);}
  for(const [n,[x,y]]of positions){svg('rect',{x:x-125,y:y-20,width:250,height:40,rx:8});const label=nodes[n].properties.label;svg('text',{x,y:y+4,'text-anchor':'middle'},label.length>35?label.slice(0,32)+'…':label);}
  $('title').textContent=`${id}: ${f.properties.title}`;$('change').textContent=f.properties.change;$('detail').textContent=JSON.stringify(f.properties,null,2);
 }
 $('build').addEventListener('change',draw);draw();
}catch(error){$('status').textContent='Plan refused: '+error.message;}
