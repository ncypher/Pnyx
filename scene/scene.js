import * as THREE from 'three';
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
 const home=()=>{camera.position.set(10,8,12);orbit.target.set(0,1,0);orbit.update();};home();$('#home').onclick=home;
 scene.add(new THREE.HemisphereLight('#ffe7bb','#3e5462',2.5));const sun=new THREE.DirectionalLight('#ffd092',3.8);sun.position.set(-4,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.04;scene.add(sun);
 const rim=new THREE.DirectionalLight('#7abed5',2);rim.position.set(4,5,-5);scene.add(rim);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
 const limestone=mat('#ddc6a1'),stone=mat('#a49078'),earth=mat('#66545c'),grass=mat('#76886c'),robe=mat('#ece3cb'),gold=mat('#d6a659'),dark=mat('#3c3843');
 function box(parent,x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function cyl(parent,x,y,z,rt,rb,h,m,n=24){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function ball(parent,x,y,z,r,m,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
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
  const head=new THREE.Group();head.position.y=1.61;body.add(head);ball(head,0,0,0,.29,skin,1,1.12,.94);ball(head,0,.15,-.025,.29,hair,1,.65,1);
  if(i)ball(head,0,-.18,.10,.22,hair,.95,.9,.8);else ball(head,0,.07,-.25,.17,hair);
  for(const dx of [-.1,.1])ball(head,dx,.02,.252,.025,dark,1,1,.5);
  const mouth=box(head,0,-.11,.266,.08,.018,.025,dark);
  for(let j=0;j<7;j++){const a=j*.6-1.8;ball(head,Math.sin(a)*.285,.20,Math.cos(a)*.19,.065,mat('#899760'),.55,.7,1.4);}
  const arms=[];for(const sign of [-1,1]){const arm=new THREE.Group();arm.position.set(sign*.26,1.18,0);body.add(arm);ball(arm,sign*.1,-.16,0,.15,robe,.9,1.6,.9);ball(arm,sign*.12,-.38,.015,.09,skin);arms.push(arm);}
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.53,.022,8,48),new THREE.MeshBasicMaterial({color:state.cast[i].color}));ring.rotation.x=Math.PI/2;ring.position.y=.015;root.add(ring);
  const label=document.createElement('div');label.className='label';stage.append(label);
  people.push({root,body,head,mouth,arms,ring,label,robe,accent});
 }
 person(0,-1.25,.2,.65);person(1,1.25,.2,-.65);
 const motes=[];for(let i=0;i<20;i++){const m=ball(scene,0,0,0,.017,new THREE.MeshBasicMaterial({color:'#f4dbac'}));motes.push(m);}
 let current=null,queue=[],index=0,timer=null,paused=false,until=0,signature='',audio=null,sound=false,nextTone=0;
 const cue=$('#cue');
 function show(line){current=line;until=performance.now()+Math.min(14000,Math.max(4500,(line?.text.length||0)*38));cue.hidden=!line;
  const c=state.cast.find(c=>c.id===line?.speaker);cue.style.setProperty('--voice',c?.color||'#e9b86c');cue.textContent=line?.move==='question'?'?':line?.move==='concession'?'≈':'•••';
  $('#speaker').textContent=line?.name||'A question hangs in the air.';$('#speaker').style.color=c?.color||'#e9b86c';$('#move').textContent=line?.move||'';
  $('#quote').textContent=line?.text||'Two perspectives. Neither has to leave unchanged.';$('#quote').scrollTop=0;requestAnimationFrame(height);
 }
 function schedule(){clearTimeout(timer);$('#pause').disabled=!queue.length;$('#pause').textContent=paused?'Resume':'Pause';$('#status').textContent=queue.length?`${paused?'Paused · ':''}${index+1} / ${queue.length}`:'The floor is open';if(paused||!queue.length)return;
  timer=setTimeout(()=>{if(index+1<queue.length){show(queue[++index]);schedule();}else{$('#pause').disabled=true;$('#status').textContent='The floor returns to you';}},Math.max(1000,until-performance.now()));
 }
 function play(lines){queue=lines;index=0;paused=false;show(queue[0]);schedule();}
 $('#replay').onclick=()=>play(state.lines||[]);$('#pause').onclick=()=>{paused=!paused;if(!paused)until=performance.now()+6000;schedule();};
 $('#sound').onclick=async()=>{try{audio ||= new (window.AudioContext||window.webkitAudioContext)();sound=!sound;if(sound)await audio.resume();else await audio.suspend();$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));}catch{sound=false;$('#sound').textContent='Sound unavailable';}};
 function mumble(i){if(!sound||!audio||audio.state!=='running'||document.hidden||audio.currentTime<nextTone)return;const t=audio.currentTime;nextTone=t+.23+Math.random()*.15;const o=audio.createOscillator(),f=audio.createBiquadFilter(),g=audio.createGain();o.type='sawtooth';o.frequency.value=(i?115:165)*(1+Math.random()*.15);f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(350,t);f.frequency.exponentialRampToValueAtTime(900,t+.08);f.frequency.exponentialRampToValueAtTime(400,t+.2);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.03,t+.03);g.gain.linearRampToValueAtTime(0,t+.23);o.connect(f);f.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.24);o.onended=()=>{o.disconnect();f.disconnect();g.disconnect();};}
 let lastId=-1,lastRevision=-1;
 apply=()=>{people.forEach((p,i)=>{p.label.textContent=state.cast[i].name;p.robe.color.set(state.cast[i].robe||'#ece3cb');p.accent.color.set(state.cast[i].color);p.ring.material.color.set(state.cast[i].color);});const lines=state.lines||[],sig=JSON.stringify([state.revision,lines.map(x=>x.id)]);$('#replay').disabled=!lines.length;if(sig!==signature){const fresh=state.revision===lastRevision?lines.filter(x=>x.id>lastId):lines;signature=sig;lastRevision=state.revision;lastId=lines.at(-1)?.id??-1;play(fresh.length?fresh:lines);}};apply();
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();height();}new ResizeObserver(resize).observe(stage);new ResizeObserver(height).observe($('#subtitle'));resize();
 const clock=new THREE.Clock(),point=new THREE.Vector3(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 renderer.setAnimationLoop(()=>{const t=clock.getElapsedTime();orbit.update();camera.updateMatrixWorld();people.forEach((p,i)=>{const active=current?.speaker===state.cast[i].id,talking=active&&!paused&&performance.now()<until;p.ring.visible=active;if(talking)mumble(i);
  if(!reduced.matches){p.body.position.y=Math.sin(t*1.7+i)*.012;p.head.rotation.z=Math.sin(t*1.5+i)*.04;p.arms[0].rotation.z=talking?.4+Math.sin(t*3)*.15:.08;p.arms[1].rotation.x=talking?-.25+Math.sin(t*2)*.12:0;p.mouth.scale.y=talking?2+Math.sin(t*13):1;}
  p.head.getWorldPosition(point);point.y+=.48;point.project(camera);const x=(point.x*.5+.5)*stage.clientWidth,y=(-point.y*.5+.5)*stage.clientHeight;p.label.style.left=`${x}px`;p.label.style.top=`${y}px`;p.label.hidden=active;
  if(active){cue.style.left=`${Math.max(8,Math.min(stage.clientWidth-60,x-25))}px`;cue.style.top=`${Math.max(56,y-25)}px`;}
 });if(!reduced.matches){flames.forEach((f,i)=>f.scale.y=1.9+Math.sin(t*8+i)*.25);motes.forEach((m,i)=>m.position.set(Math.sin(i*2.4+t*.05)*3.7,.9+(i%5)*.4+Math.sin(t*.5+i)*.1,Math.cos(i*2.4+t*.05)*3.7));}renderer.render(scene,camera);});
 addEventListener('pagehide',()=>{clearTimeout(timer);audio?.close();});
}catch(e){$('#fallback').style.display='block';console.error('Pnyx garden could not start',e);}
