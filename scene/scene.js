import * as THREE from 'three';
import {readingTime, mergeQueue} from './playback.mjs';
import {OrbitControls} from './vendor/OrbitControls.js';
const $=s=>document.querySelector(s),stage=$('#stage');
const send=(type,rest={})=>parent.postMessage({isStreamlitMessage:true,type,...rest},'*');
const height=()=>send('streamlit:setFrameHeight',{height:document.body.scrollHeight});
let state={cast:[{id:'a',name:'Lysandra',color:'#e9b86c'},{id:'b',name:'Damon',color:'#78c8bc'}],lines:[],revision:0},apply=()=>{};
addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='streamlit:render'){state=e.data.args;apply();requestAnimationFrame(height);}});
send('streamlit:componentReady',{apiVersion:1});height();
try{
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;stage.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100),orbit=new OrbitControls(camera,renderer.domElement);
 orbit.enableDamping=true;orbit.enablePan=false;orbit.minDistance=9;orbit.maxDistance=19;orbit.minPolarAngle=.35;orbit.maxPolarAngle=1.35;
 const home=()=>{camera.position.set(9.5,7.2,11.5);orbit.target.set(0,1,0);orbit.update();};home();$('#home').onclick=home;
 scene.add(new THREE.HemisphereLight('#ffe7bb','#3e5462',2.5));const sun=new THREE.DirectionalLight('#ffd092',3.8);sun.position.set(-4,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.04;scene.add(sun);
 const rim=new THREE.DirectionalLight('#7abed5',2);rim.position.set(4,5,-5);scene.add(rim);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
 const limestone=mat('#ddc6a1'),stone=mat('#a49078'),earth=mat('#66545c'),grass=mat('#76886c'),robe=mat('#ece3cb'),gold=mat('#d6a659'),dark=mat('#3c3843');
 function box(parent,x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function cyl(parent,x,y,z,rt,rb,h,m,n=24){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function ball(parent,x,y,z,r,m,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
 // A terraced slice of earth, suspended in an evening sky.
 cyl(scene,0,-.65,0,4.45,2.9,1.55,earth,8);cyl(scene,0,.08,0,4.5,4.35,.35,stone,8);cyl(scene,0,.28,0,4.25,4.4,.16,grass,8);
 cyl(scene,0,.42,.15,2.85,3.1,.23,limestone,12);cyl(scene,0,.57,.15,2.5,2.7,.15,stone,12);cyl(scene,0,.67,.15,2.45,2.45,.06,limestone,12);
 for(let i=0;i<14;i++){const a=i*Math.PI*2/14;box(scene,Math.cos(a)*2.05,.715,Math.sin(a)*2.05+.15,.14,.016,.06,gold).rotation.y=-a;}
 // A crescent of ruined columns frames the debate, leaving the foreground open.
 for(const [x,z,h] of [[-3,-1.5,2.4],[0,-3,3],[2.5,-2.1,2.7]]){
  box(scene,x,.5,z,.85,.25,.85,limestone);cyl(scene,x,.7+h/2,z,.23,.3,h,limestone,16);box(scene,x,.72+h,z,.85,.22,.85,limestone);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;cyl(scene,x+Math.cos(a)*.26,.7+h/2,z+Math.sin(a)*.26,.025,.025,h-.1,stone,6);}
 }
 box(scene,1.25,3.65,-2.55,3.4,.32,.75,limestone).rotation.y=.33;
 // Olive tree, amphorae, flowers, steps, and a quiet moderator's lectern.
 const tree=new THREE.Group();tree.position.set(-3,.4,1.5);scene.add(tree);cyl(tree,0,.9,0,.13,.24,1.8,mat('#746556'),8);
 for(let i=0;i<8;i++){const a=i*2.4;ball(tree,Math.cos(a)*.5,1.9+(i%3)*.23,Math.sin(a)*.5,.62,mat(i%2?'#809786':'#526f66'),1,.75,1);}
 for(const [x,z] of [[3,1.4],[2.5,2.4]]){ball(scene,x,.7,z,.32,mat('#ba8261'),1,1.5,1);cyl(scene,x,1.13,z,.15,.12,.2,limestone);}
 for(let i=0;i<26;i++){const a=i*2.4,r=3.25+(i%4)*.12;const x=Math.cos(a)*r,z=Math.sin(a)*r;ball(scene,x,.49,z,.055,mat(i%2?'#dab56d':'#a6b8b5'));}
 for(let i=0;i<3;i++)box(scene,0,.12+i*.14,3.4-i*.3,1.45,.16,.5,limestone);
 cyl(scene,0,1.05,-1.65,.12,.23,.7,stone);box(scene,0,1.45,-1.65,.75,.1,.5,limestone).rotation.x=.2;box(scene,0,1.53,-1.65,.38,.025,.3,robe).rotation.x=.2;
 const flames=[];
 for(const x of [-2.9,2.9]){cyl(scene,x,.95,.1,.07,.13,1.1,dark);cyl(scene,x,1.5,.1,.22,.1,.16,gold);const f=ball(scene,x,1.72,.1,.16,new THREE.MeshBasicMaterial({color:'#ffb768'}),.65,1.9,.65);flames.push(f);const light=new THREE.PointLight('#ffa259',3,3);light.position.set(x,1.8,.1);scene.add(light);}
 const people=[];
 function person(i,x,z,angle){
  const root=new THREE.Group();root.position.set(x,.72,z);root.rotation.y=angle;scene.add(root);
  const body=new THREE.Group();root.add(body);const skin=mat(i?'#a77960':'#d1a080'),hair=mat(i?'#4b4240':'#604c3e'),accent=mat(state.cast[i].color),robe=mat(state.cast[i].robe||'#ece3cb');
  for(const dx of [-.17,.17])box(body,dx,.06,.08,.18,.1,.32,dark);
  cyl(body,0,.55,0,.26,.43,1,robe,12);ball(body,0,1.04,0,.31,robe,1,1.35,.8);
  const sash=box(body,.10,.91,.22,.17,.81,.06,accent);sash.rotation.z=-.23;const belt=cyl(body,0,.81,0,.30,.30,.055,gold,12);belt.scale.z=.8;
  // Drapery folds, a shoulder clasp, sandal straps, and a scroll at the belt.
  for(let j=0;j<12;j++){const a=j*Math.PI/6;cyl(body,Math.sin(a)*.30,.47,Math.cos(a)*.30,.016,.04,.77,robe,6);}
  ball(body,-.25,1.18,.18,.065,gold);cyl(body,-.30,.68,.20,.055,.055,.28,limestone,12).rotation.z=.3;
  for(const dx of [-.17,.17])for(const dz of [.03,.13])box(body,dx,.12,dz,.19,.025,.035,gold);
  const head=new THREE.Group();head.position.y=1.61;body.add(head);ball(head,0,0,0,.29,skin,1,1.12,.94);ball(head,0,.15,-.025,.29,hair,1,.65,1);
  if(i)ball(head,0,-.18,.10,.22,hair,.95,.9,.8);else ball(head,0,.07,-.25,.17,hair);
  for(const dx of [-.1,.1]){ball(head,dx,.02,.254,.038,robe,1,.8,.45);ball(head,dx,.02,.276,.018,dark,1,1,.5);const brow=box(head,dx,.082,.25,.08,.014,.024,hair);brow.rotation.z=dx*(i?-1:1);ball(head,dx*2.85,-.02,0,.058,skin,.6,1,.8);}
  ball(head,0,-.035,.284,.04,skin,.75,1,1);
  const mouth=box(head,0,-.11,.266,.08,.018,.025,dark);
  for(let j=0;j<7;j++){const a=j*.6-1.8;ball(head,Math.sin(a)*.285,.20,Math.cos(a)*.19,.065,mat('#899760'),.55,.7,1.4);}
  const arms=[];for(const sign of [-1,1]){const arm=new THREE.Group();arm.position.set(sign*.26,1.18,0);body.add(arm);ball(arm,sign*.1,-.16,0,.15,robe,.9,1.6,.9);ball(arm,sign*.12,-.38,.015,.09,skin);arms.push(arm);}
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.53,.022,8,48),new THREE.MeshBasicMaterial({color:state.cast[i].color}));ring.rotation.x=Math.PI/2;ring.position.y=.015;root.add(ring);
  const label=document.createElement('div');label.className='label';stage.append(label);
  people.push({root,body,head,mouth,arms,ring,label,robe,accent});
 }
 person(0,-1.25,.2,.65);person(1,1.25,.2,-.65);
 // Inlaid astronomy mosaic: a little theatre for ideas rather than a bare disk.
 const mosaic=document.createElement('canvas');mosaic.width=mosaic.height=512;const ink=mosaic.getContext('2d');
 ink.fillStyle='#d7c69e';ink.fillRect(0,0,512,512);ink.translate(256,256);
 for(let ring=0;ring<3;ring++){ink.strokeStyle=ring%2?'#bc9349':'#3e7277';ink.lineWidth=ring===1?5:12;ink.beginPath();ink.arc(0,0,224-ring*20,0,Math.PI*2);ink.stroke();}
 for(let i=0;i<48;i++){ink.save();ink.rotate(i*Math.PI/24);ink.fillStyle=i%2?'#3e7277':'#c7994a';ink.fillRect(207,-4,11,8);ink.restore();}
 for(let i=0;i<16;i++){ink.save();ink.rotate(i*Math.PI/8);ink.fillStyle=i%2?'#75938a':'#bd985b';ink.beginPath();ink.moveTo(0,-115);ink.lineTo(12,-28);ink.lineTo(0,0);ink.lineTo(-12,-28);ink.closePath();ink.fill();ink.restore();}
 const tile=new THREE.CanvasTexture(mosaic);tile.colorSpace=THREE.SRGBColorSpace;tile.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const floor=new THREE.Mesh(new THREE.CircleGeometry(2.43,96),new THREE.MeshStandardMaterial({map:tile,roughness:.65}));floor.rotation.x=-Math.PI/2;floor.position.set(0,.709,.15);floor.receiveShadow=true;scene.add(floor);
 function torus(parent,x,y,z,r,tube,material,flat=false){const m=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,40),material);m.position.set(x,y,z);if(flat)m.rotation.x=Math.PI/2;parent.add(m);return m;}
 torus(scene,0,.30,0,4.35,.025,gold,true);torus(scene,0,.73,.15,2.47,.018,gold,true);
 // Ionic scroll capitals and carved bases.
 for(const [x,z,h] of [[-3,-1.5,2.4],[0,-3,3],[2.5,-2.1,2.7]]){
  for(const dx of [-.28,.28]){torus(scene,x+dx,.70+h,z+.39,.12,.035,limestone);ball(scene,x+dx,.70+h,z+.39,.035,gold);}
  for(const y of [.66,.78,.57+h])cyl(scene,x,y,z,.33,.33,.055,limestone,32);
 }
 const banners=[];
 for(const [x,z,color] of [[-3.5,-1.9,'#a05b72'],[2.9,-2.6,'#387d86']]){
  cyl(scene,x,2,z,.025,.035,3.2,gold,12);box(scene,x,3.42,z,.88,.055,.055,gold);
  const fabric=new THREE.Mesh(new THREE.PlaneGeometry(.76,1.18,12,16),new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:1}));fabric.position.set(x,2.79,z);scene.add(fabric);banners.push(fabric);
  const medallion=torus(scene,x,2.88,z+.04,.16,.017,gold);box(scene,x,2.88,z+.055,.10,.10,.02,gold).rotation.z=Math.PI/4;
 }
 // A ring of flowers and draping vines, with a brass-trimmed reading bench.
 const leaf=mat('#486f65'),petal=mat('#c993b4');
 for(let i=0;i<24;i++){const a=i*2.399,r=3.65+(i%3)*.10,x=Math.cos(a)*r,z=Math.sin(a)*r;
  cyl(scene,x,.53,z,.016,.018,.24,leaf,5);for(let j=0;j<4;j++)ball(scene,x+Math.cos(j*Math.PI/2)*.06,.66,z+Math.sin(j*Math.PI/2)*.06,.045,i%3?petal:gold,1,.6,1);ball(scene,x,.67,z,.025,gold);
 }
 for(let i=0;i<18;i++){const a=i*.5;ball(scene,-3.9+Math.sin(a)*.18,.2-i*.045,.8+Math.cos(a)*.15,.09,leaf,1,.6,.55);}
 box(scene,-1.6,.62,-2.0,1.5,.15,.45,limestone);for(const dx of [-.5,.5])box(scene,-1.6+dx,.46,-2,.15,.32,.34,stone);
 // A far-off silhouette and a gold evening moon add depth beyond the island.
 const distant=mat('#485b6d');cyl(scene,-7,-1.6,-9,2.1,1.1,1.1,distant,7);cyl(scene,7,-2,-11,2.8,1.4,1.4,distant,7);
 for(let i=0;i<5;i++)box(scene,-8+i*.5,-.35,-9,.14,1.4,.18,distant);
 const moon=ball(scene,-5.2,4.2,-11,1.05,new THREE.MeshBasicMaterial({color:'#edc58a'}));
 torus(scene,-5.2,4.2,-10.98,1.3,.012,new THREE.MeshBasicMaterial({color:'#cda773'}));
 const motes=[];for(let i=0;i<20;i++){const m=ball(scene,0,0,0,.017,new THREE.MeshBasicMaterial({color:'#f4dbac'}));motes.push(m);}
 let current=null,queue=[],index=0,timer=null,paused=false,until=0,signature='',audio=null,sound=false,finished=true,remaining=0;
 let acknowledged='';
 function readingComplete(){const w=state.waiting;if(w&&current?.id===w.line_id&&acknowledged!==w.token){acknowledged=w.token;send('streamlit:setComponentValue',{value:w,dataType:'json'});}}
 const cue=$('#cue');
 function show(line){current=line;remaining=readingTime(line?.text,$('#pace').value);until=performance.now()+remaining;finished=!line;cue.hidden=!line;
  const c=state.cast.find(c=>c.id===line?.speaker);cue.style.setProperty('--voice',c?.color||'#e9b86c');cue.textContent=line?.move==='question'?'?':line?.move==='concession'?'≈':'•••';
  $('#speaker').textContent=line?.name||'A question hangs in the air.';$('#speaker').style.color=c?.color||'#e9b86c';$('#move').textContent=line?.move||'';
  $('#quote').textContent=line?.text||'Two perspectives. Neither has to leave unchanged.';$('#quote').scrollTop=0;if(line&&!paused)chime(state.cast.findIndex(c=>c.id===line.speaker));requestAnimationFrame(height);
 }
 function schedule(){
  clearTimeout(timer);$('#pause').disabled=finished;$('#skip').disabled=finished;
  $('#pause').textContent=paused?'Resume':'Pause';
  $('#status').textContent=finished?(queue.length?'The floor returns to you':'The floor is open'):`${paused?'Paused · ':''}${index+1} / ${queue.length}`;
  if(paused||finished)return;
  timer=setTimeout(advance,Math.max(100,until-performance.now()));
 }
 function advance(){if(index+1<queue.length){show(queue[++index]);}else{finished=true;until=0;readingComplete();}schedule();}
 function play(lines){queue=lines;index=0;paused=false;show(queue[0]);schedule();}
 $('#replay').onclick=()=>play(state.lines||[]);
 $('#skip').onclick=advance;
 $('#pause').onclick=()=>{paused=!paused;if(paused)remaining=Math.max(0,until-performance.now());else until=performance.now()+remaining;schedule();};
 $('#pace').onchange=()=>{remaining=readingTime(current?.text,$('#pace').value);until=performance.now()+remaining;schedule();};
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&!finished){paused=true;remaining=Math.max(0,until-performance.now());schedule();}});
 $('#sound').onclick=async()=>{try{audio ||= new (window.AudioContext||window.webkitAudioContext)();sound=!sound;if(sound)await audio.resume();else await audio.suspend();$('#sound').textContent=sound?'Chimes on':'Chimes off';$('#sound').setAttribute('aria-pressed',String(sound));if(sound)chime(state.cast.findIndex(c=>c.id===current?.speaker));}catch{sound=false;$('#sound').textContent='Sound unavailable';}};
 // A short two-note signature at the handoff; no continuous speech imitation.
 function chime(i){
  if(!sound||!audio||audio.state!=='running'||document.hidden)return;
  const notes=i===1?[392,329.63]:[293.66,440];
  notes.forEach((frequency,j)=>{const t=audio.currentTime+j*.22,o=audio.createOscillator(),g=audio.createGain();
   o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06*Number($('#volume').value)/100,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.55);
   o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.6);o.onended=()=>{o.disconnect();g.disconnect();};
  });
 }
 let lastId=-1,lastRevision=-1,lastSequence=null;
 apply=()=>{people.forEach((p,i)=>{p.label.textContent=state.cast[i].name;p.robe.color.set(state.cast[i].robe||'#ece3cb');p.accent.color.set(state.cast[i].color);p.ring.material.color.set(state.cast[i].color);});const lines=state.lines||[],sig=JSON.stringify([state.revision,lines.map(x=>x.id)]);$('#replay').disabled=!lines.length;const newSequence=state.sequence_id && state.sequence_id!==lastSequence;lastSequence=state.sequence_id;if(sig!==signature||newSequence){const sameDebate=state.revision===lastRevision;const fresh=sameDebate?lines.filter(x=>x.id>lastId):lines;signature=sig;lastRevision=state.revision;lastId=lines.at(-1)?.id??-1;if(sameDebate&&!finished&&!newSequence){queue=mergeQueue(queue,fresh,true);schedule();}else{play(fresh.length?fresh:lines);}}};apply();
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();height();}new ResizeObserver(resize).observe(stage);new ResizeObserver(height).observe($('#subtitle'));resize();
 const clock=new THREE.Clock(),point=new THREE.Vector3(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 renderer.setAnimationLoop(()=>{const t=clock.getElapsedTime();orbit.update();camera.updateMatrixWorld();people.forEach((p,i)=>{const active=current?.speaker===state.cast[i].id,talking=active&&!paused&&performance.now()<until;p.ring.visible=active;
  if(!reduced.matches){p.body.position.y=Math.sin(t*1.7+i)*.012;p.head.rotation.z=Math.sin(t*1.5+i)*.04;p.arms[0].rotation.z=talking?.4+Math.sin(t*3)*.15:.08;p.arms[1].rotation.x=talking?-.25+Math.sin(t*2)*.12:0;p.mouth.scale.y=talking?2+Math.sin(t*13):1;}
  p.head.getWorldPosition(point);point.y+=.48;point.project(camera);const x=(point.x*.5+.5)*stage.clientWidth,y=(-point.y*.5+.5)*stage.clientHeight;p.label.style.left=`${x}px`;p.label.style.top=`${y}px`;p.label.hidden=active;
  if(active){cue.style.left=`${Math.max(8,Math.min(stage.clientWidth-60,x-25))}px`;cue.style.top=`${Math.max(56,y-25)}px`;}
 });if(!reduced.matches){banners.forEach((b,i)=>{const v=b.geometry.attributes.position;for(let j=0;j<v.count;j++)v.setZ(j,Math.sin(v.getX(j)*5+t*1.2+i)*.035*(.65-v.getY(j)));v.needsUpdate=true;b.geometry.computeVertexNormals();});flames.forEach((f,i)=>f.scale.y=1.9+Math.sin(t*8+i)*.25);motes.forEach((m,i)=>m.position.set(Math.sin(i*2.4+t*.05)*3.7,.9+(i%5)*.4+Math.sin(t*.5+i)*.1,Math.cos(i*2.4+t*.05)*3.7));}renderer.render(scene,camera);});
 addEventListener('pagehide',()=>{clearTimeout(timer);audio?.close();});
}catch(e){$('#fallback').style.display='block';console.error('Pnyx garden could not start',e);}
