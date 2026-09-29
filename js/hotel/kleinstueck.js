/* Hotel Alice Lloyd: Suite 1876 · Kleinstueck, "The Preserve" (the shore lane, the bog room, the boardwalk to Suite 1912, the pine lane back).
   Honors Caroline Hubbard Kleinstuck (the house is spelled KLEINSTUECK). She is the host; the only scare is the invented Warden. */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;
/* ---- HOTEL KIT v1 (paste verbatim right after the H guard in every area file; the first copy to load defines it) ---- */
var SC=H.SC, THREE=window.THREE, M=H.mat;
if(!H.kit){ H.kit=1;
  var TW=[], CULL=[], OV=false, capEl=document.getElementById('caption');
  H.tween=function(d,f,done){ var w={t:0,d:Math.max(0.001,d),f:f,done:done,dead:false}; TW.push(w); return w; };   // f(p) with p 0..1; set w.dead=true to cancel
  H.after=function(d,fn){ return H.tween(d,function(){},fn); };
  H.onUpdate(function(dt){ for(var i=TW.length-1;i>=0;i--){ var w=TW[i]; if(w.dead){ TW.splice(i,1); continue; }
    w.t=Math.min(w.d,w.t+dt); w.f(w.t/w.d); if(w.t>=w.d){ TW.splice(i,1); if(w.done) w.done(); } } });
  H.fade=function(mat,to,d){ var a=mat.opacity; return H.tween(d,function(p){ mat.opacity=a+(to-a)*p; }); };
  H.lightTo=function(L,to,d){ var a=L.intensity; return H.tween(d||0.01,function(p){ L.intensity=a+(to-a)*p; }); };
  H.keepAway=function(o,minM){ var h=H.headPos(), dx=o.position.x-h.x, dz=o.position.z-h.z, d=Math.hypot(dx,dz);   // o: scene-level object, position in meters
    if(d<minM){ if(d<1e-4){ dx=1; dz=0; d=1; } o.position.x=h.x+dx/d*minM; o.position.z=h.z+dz/d*minM; } };
  H.heading=function(dx,dz){ var y=H.player().yaw, l=Math.hypot(dx,dz)||1; return (Math.sin(y)*dx+Math.cos(y)*dz)/l>0.3; };   // facing roughly toward plan direction (dx,dz)
  H.quiet=function(){ return !capEl || !capEl.textContent; };   // nobody is speaking and nothing is queued
  H.LINES={}; H.addLines=function(o){ for(var k in o) H.LINES[k]=o[k]; };   // {ID:{t:'text', at:'grilleId', who:'NAME'}}
  H.lineDur=function(id){ return 1.6+0.066*H.LINES[id].t.length; };
  H.line=function(id,o){ var L=H.LINES[id]; if(!L) return; o=o||{}; var who=L.who||'DEAN LLOYD';
    H.say(L.t,{who:who,at:L.at,interrupt:!!o.interrupt,voice:who==='DEAN LLOYD'?undefined:false}); };
  H.nzones=[];   // every one-shot zone goes here so replay re-arms it
  H.narrateIds=function(ids,b,o){ o=o||{}; var z=H.zone({x1:b[0],z1:b[1],x2:b[2],z2:b[3],once:true,when:o.when,
    enter:function(){ ids.forEach(function(id){ H.line(id); }); if(o.then) o.then(); }}); H.nzones.push(z); return z; };
  H.resets=[]; H.shows=[]; H.cue=function(c){ var s=H.show(c); H.shows.push(s); return s; };
  H.replay=function(){ H.shows.forEach(function(s){ s.stop(); }); TW.forEach(function(w){ w.dead=true; });
    H.nzones.forEach(function(z){ z.fired=false; }); H.resets.forEach(function(f){ try{ f(); }catch(e){ console.warn(e); } });
    for(var k in H.stay) delete H.stay[k]; H.stay.suites={};
    H.say([''],{interrupt:true,who:'',voice:false,hold:0.05}); H.cap(''); H.teleport(206,565,Math.PI/2); };
  window.addEventListener('keydown',function(e){ if(e.code==='Tab' && !H.renderer.xr.isPresenting) OV=!OV; });
  H.cull=function(g,boxes){ CULL.push({g:g,b:boxes}); return g; };   // show group g only while the player is inside one of boxes [[x1,z1,x2,z2],..] (always in bird's-eye)
  H.onUpdate(function(){ var p=H.player(); for(var c=0;c<CULL.length;c++){ var v=OV, bs=CULL[c].b;
    for(var i=0;!v&&i<bs.length;i++){ var b=bs[i]; v=p.x>b[0]&&p.x<b[2]&&p.z>b[1]&&p.z<b[3]; } CULL[c].g.visible=v; } });
  H.rng=function(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
}
/* ---- end HOTEL KIT ---- */

var PI=Math.PI, R=H.rng(1876), show, reset, dm=new THREE.Object3D(), V3=new THREE.Vector3(), i;
function cv(w,h,draw){ var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); return c; }
function lit(tex,k){ return new THREE.MeshLambertMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:k}); }   // painted art: reads in show mode, brightens under house lights
function fit(g,txt,x,y,maxW,px,style,fam){ var f=px; do{ g.font=(style?style+' ':'')+f+'px '+(fam||'Georgia,serif'); f--; }while(g.measureText(txt).width>maxW && f>7); g.fillText(txt,x,y); }
// the route through this zone (the spec's points and route.js's current ones): props keep 12.5 units off it
var PATHS=[[[299,378],[290,350],[244,320],[242,290],[244,226],[270,213],[304,216],[308,262],[332,288],[455,345]],[[458,310],[400,282],[356,258],[350,232]],
  [[299,378],[252,360],[244,290],[246,222],[270,206],[300,210],[308,262]],[[455,318],[400,286],[356,258]]];
var PLK=[[243,305,243,213],[243,213,306,213],[306,213,307,262],[307,262,332,288],[332,288,440,338.9]];
function dseg(px,pz,a,b){ var dx=b[0]-a[0], dz=b[1]-a[1], t=((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz||1); t=Math.max(0,Math.min(1,t)); return Math.hypot(px-a[0]-dx*t,pz-a[1]-dz*t); }
function droute(x,z){ var m=1e9; PATHS.forEach(function(P){ for(var k=1;k<P.length;k++) m=Math.min(m,dseg(x,z,P[k-1],P[k])); }); return m; }
function dplank(x,z){ var m=1e9; PLK.forEach(function(p){ m=Math.min(m,dseg(x,z,[p[0],p[1]],[p[2],p[3]])); }); return m; }
function dKD(x,z){ return -(x-330)*0.4664+(z-262)*0.8845; }   // signed: + south of KD (the boardwalk side), - north (the pine lane)

// ---------- 1. structure ----------
var G=H.cull(H.group(0,0),[[218,190,445,392],[328,180,462,250],[270,390,330,432],[440,284,476,362]]);   // + the doorway view from Room 1 and the look back from Suite 1912
var d1876=H.suiteDoor({x1:318,z1:390,x2:280,z2:390,approach:-1,plate:['1876 · KLEINSTUECK'],num:'1876',
  ready:function(){ return !!H.stay.angellDone; }, onOpen:function(){ show.go(); }});   // the doorway x 280-318; entered from Room 1's side; leaves swing north
H.curtain(330,245,330,262);   // K2E: Room 2's east side below the wall
H.curtain(330,262,440,320);   // KD: splits the two boardwalks (the way in, south; the pine lane back, north)
var railMat=H.lam(0x6b5a44), railParts=[];
function rail(x1,z1,x2,z2){ H.seg(x1,z1,x2,z2); H.map.curtains.push([x1,z1,x2,z2,'#7fae5a']); H.cap2d(x1,z1,x2,z2,'#7fae5a',0.95,0.1);
  var dx=x2-x1, dz=z2-z1, L=Math.hypot(dx,dz), ry=-Math.atan2(dz,dx), n=Math.max(1,Math.round(L/25));
  railParts.push(H.box(L*SC,0.05,0.05,railMat,(x1+x2)/2,0.9,(z1+z2)/2,ry), H.box(L*SC,0.04,0.04,railMat,(x1+x2)/2,0.45,(z1+z2)/2,ry));
  for(var k=0;k<=n;k++) railParts.push(H.box(0.05,0.92,0.05,railMat,x1+dx*k/n,0.46,z1+dz*k/n)); }
rail(320,390,322,305);   // KW: the shore lane's east rail (open water beyond); starts 2 units east of the jamb so the open leaf clears it
rail(262,305,322,305);   // KP: the island's south side and the fence between the shore and the bog room's exit
rail(262,234,262,305); rail(262,234,290,234); rail(290,234,290,305);   // the island in the bog (x 262-290, z 234-305)
rail(322,305,440,358.6); // KS: the boardwalk's south rail over the open water
var KS0=[322,305], KSL=Math.hypot(118,53.6), KSU=[118/KSL,53.6/KSL], KSN=[KSU[1],-KSU[0]], RYKS=Math.atan2(KSN[0],KSN[1]);   // KSN points at the boardwalk
var LX=[], LZ=[], WORD='KLEINSTUECK';
for(i=0;i<11;i++){ LX.push(KS0[0]+KSU[0]*KSL*(i+0.5)/11); LZ.push(KS0[1]+KSU[1]*KSL*(i+0.5)/11); railParts.push(H.box(0.05,0.2,0.05,railMat,LX[i],1.0,LZ[i],RYKS)); }   // a lamp post per true letter
var LAN=[[345,342,'KLENSTEUK'],[388,368,'KLEINSTADT'],[428,380,'KLEINSEUCK']];
LAN.forEach(function(l){ railParts.push(H.box(0.06,1.17,0.06,railMat,l[0],0.585,l[1]), H.box(0.22,0.04,0.22,railMat,l[0],1.45,l[1]), H.box(0.2,0.03,0.2,railMat,l[0],1.16,l[1])); });
[[0,0.33,0.9,0.05],[0,-0.33,0.9,0.05],[-0.425,0,0.05,0.7],[0.425,0,0.05,0.7]].forEach(function(f){ railParts.push(H.box(f[2],f[3],0.04,railMat,405+f[0]/SC,1.5+f[1],247.5)); });   // the pine window's frame
(function(){ var b=H.box(0.54,0.42,0.025,railMat,276,0.565,237.48); b.rotation.order='YXZ'; b.rotation.set(-0.25,PI,0);   // the diploma's board and stake, like a preserve's trail sign
  railParts.push(b, H.box(0.06,0.45,0.06,railMat,276,0.225,237.85)); })();
G.add(H.merge(railParts,railMat));

// ---------- 2. floors ----------
var N=128, NN=N*N, ra=new Float32Array(NN), rb=new Float32Array(NN), base=new Uint8ClampedArray(NN*3);
var bogC=cv(N,N,function(g){ g.fillStyle='#06110e'; g.fillRect(0,0,N,N); }), bctx=bogC.getContext('2d'), img=bctx.createImageData(N,N), px=img.data;
var bogTex=new THREE.CanvasTexture(bogC); bogTex.minFilter=THREE.LinearFilter; bogTex.generateMipmaps=false;
var bogMat=new THREE.MeshBasicMaterial({map:bogTex}); G.add(H.floorPatch(222,197,330,305,bogMat,0.009));
(function(){ for(var y=0;y<N;y++) for(var x=0;x<N;x++){ var n=0.5+0.25*Math.sin(x*0.19+Math.sin(y*0.11)*2.3)+0.25*Math.sin(y*0.23+Math.cos(x*0.07)*1.7), r=R(), k=(y*N+x)*3;
  base[k]=5+n*8+r*5; base[k+1]=15+n*12+r*6; base[k+2]=12+n*6+r*4; } })();
var peatTex=H.canvasTex(256,256,function(g,w,h){ g.fillStyle='#22170d'; g.fillRect(0,0,w,h); for(var k=0;k<2600;k++){ var c=Math.random();
  g.fillStyle=c<0.5?'rgba(60,42,24,0.6)':c<0.8?'rgba(10,6,4,0.7)':'rgba(84,66,38,0.45)'; g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*2); } });
peatTex.size=[1.2,1.2]; var peatMat=H.lam(0xffffff,{map:peatTex});
G.add(H.merge([H.floorPatch(222,305,322,361,peatMat,0.006),H.floorPatch(273,361,321,390,peatMat,0.006)],peatMat));   // stays out of the Window box
var waterTex=H.canvasTex(256,256,function(g,w,h){ g.fillStyle='#050b0a'; g.fillRect(0,0,w,h); for(var k=0;k<110;k++){ var y=Math.random()*h, x=Math.random()*w, L=20+Math.random()*60;
  g.strokeStyle='rgba(70,150,130,'+(0.05+Math.random()*0.13)+')'; g.lineWidth=1; [x,x-w].forEach(function(x0){ g.beginPath(); for(var s=0;s<=L;s+=4){ var yy=y+Math.sin(s*0.15)*2; if(s) g.lineTo(x0+s,yy); else g.moveTo(x0+s,yy); } g.stroke(); }); } });
waterTex.repeat.set(0.45,0.45);
(function(){ var pts=[[330,262],[440,320],[440,390],[320,390],[322,305],[330,305]], s=new THREE.Shape();   // open water under the boardwalk and south of it
  pts.forEach(function(p,k){ if(k) s.lineTo(p[0]*SC,-p[1]*SC); else s.moveTo(p[0]*SC,-p[1]*SC); });
  var m=new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshBasicMaterial({map:waterTex,side:THREE.DoubleSide})); m.rotation.x=-PI/2; m.position.y=0.007; G.add(m); })();
var needleTex=H.canvasTex(256,256,function(g,w,h){ g.fillStyle='#2a1a0c'; g.fillRect(0,0,w,h); for(var k=0;k<1900;k++){ var x=Math.random()*w, y=Math.random()*h, a=Math.random()*PI, L=4+Math.random()*9, c=Math.random();
  g.strokeStyle=c<0.45?'rgba(130,80,34,0.8)':c<0.8?'rgba(86,52,22,0.8)':'rgba(170,118,56,0.6)'; g.lineWidth=1; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L); g.stroke(); } });
needleTex.size=[1,1]; var needleMat=H.lam(0xffffff,{map:needleTex});
G.add(H.merge([H.floorPatch(330,247,440,300,needleMat,0.006),H.floorPatch(390,300,440,320,needleMat,0.006)],needleMat));   // the second patch fills the wedge north of KD at the Suite 1912 end (the water covers its south part)
// planks along the U and the boardwalk: 1 m strips, ends lapped at the corners
var plankTex=H.canvasTex(256,64,function(g,w,h){ g.fillStyle='#d6cbb4'; g.fillRect(0,0,w,h); for(var b=0;b<4;b++){ var x=b*64;
  g.fillStyle='rgba(60,40,20,'+(0.08+Math.random()*0.22)+')'; g.fillRect(x,0,64,h); for(var k=0;k<7;k++){ g.fillStyle='rgba(70,50,30,0.28)'; g.fillRect(x+5+Math.random()*54,0,1,h); }
  g.fillStyle='#2a2018'; g.fillRect(x,0,4,h); g.fillStyle='#3a2c20'; g.fillRect(x+10,8,3,3); g.fillRect(x+10,h-11,3,3); } });
var plankMat=H.lam(0x7a6448,{map:plankTex}), plk=[], EXT=[[0,0.5],[0.5,0.5],[0.5,0.3],[0.3,0.3],[0.3,0]];
PLK.forEach(function(p,k){ var dx=p[2]-p[0], dz=p[3]-p[1], L0=Math.hypot(dx,dz), ux=dx/L0, uz=dz/L0, a=EXT[k][0]/SC, b=EXT[k][1]/SC, L=(L0+a+b)*SC;
  var geo=new THREE.PlaneGeometry(L,k<4?0.8:1,Math.ceil(L/0.5),1); H.scaleUV(geo,L/0.6,1); var m=new THREE.Mesh(geo,plankMat);
  m.rotation.x=-PI/2; m.rotation.z=-Math.atan2(dz,dx); m.position.set((p[0]+p[2]-ux*a+ux*b)/2*SC,0.012+k*0.0015,(p[1]+p[3]-uz*a+uz*b)/2*SC); plk.push(m); });
G.add(H.merge(plk,plankMat));

// ---------- 2. dressing ----------
// reeds: clumps by the shore wall, on the island, and in the water beyond KW and KS
var reedGeo=new THREE.CylinderGeometry(0.012,0.02,1,5); reedGeo.translate(0,0.5,0);
var reeds=new THREE.InstancedMesh(reedGeo,H.lam(0x3c4a2a),70), REED=[];
var ISP=[[268,262],[283,262],[270,280],[284,290],[272,298]], CABX=415.5, CABZ=355.5;   // the cabinet sits between true letters 8 and 9
function reedOK(x,z,reg){ if(droute(x,z)<12.5 || dplank(x,z)<18.5) return false;
  if(reg===0) return x>222.8 && x<230 && z>305 && z<360;
  if(reg===1){ if(x<263.5||x>288.5||z<235.5||z>303.5) return false; if(z<253 && x>263 && x<289) return false;   // the woodpile and the diploma
    if(Math.hypot(x-276,z-284)<11 || Math.hypot(x-281,z-275)<11) return false; for(var k=0;k<ISP.length;k++) if(Math.hypot(x-ISP[k][0],z-ISP[k][1])<9) return false; return true; }
  if(reg===2){ var xk=320+2*(390-z)/85; return z>309 && z<387 && x>xk+2 && x<xk+10 && !(x<325 && z>368); }
  var s=(x-KS0[0])*KSN[0]+(z-KS0[1])*KSN[1]; if(s>-2 || s<-10 || x<328 || x>436) return false;
  if(Math.hypot(x-CABX,z-CABZ)<13) return false; for(var j=0;j<3;j++) if(Math.hypot(x-LAN[j][0],z-LAN[j][1])<8) return false; return true; }
function reedCenter(reg){ for(var t=0;t<60;t++){ var x,z;
  if(reg===0){ x=223.5+R()*6; z=312+R()*47; } else if(reg===1){ x=264+R()*24; z=253+R()*50; } else if(reg===2){ z=312+R()*74; x=320+2*(390-z)/85+3+R()*6; }
  else { var tt=0.05+R()*0.9, o=3+R()*6; x=KS0[0]+KSU[0]*KSL*tt-KSN[0]*o; z=KS0[1]+KSU[1]*KSL*tt-KSN[1]*o; }
  if(reedOK(x,z,reg)) return [x,z]; } return null; }
(function(){ var plan=[0,0,0,1,1,1,1,2,2,2,3,3,3,3,3,3], n=0, guard=0;
  while(n<70 && guard++<400){ var reg=plan[guard%plan.length], c=reedCenter(reg); if(!c) continue; var m=3+Math.floor(R()*4);
    for(var k=0;k<m && n<70;k++){ var x=c[0]+(R()-0.5)*5, z=c[1]+(R()-0.5)*5; if(!reedOK(x,z,reg)) continue; var h=0.6+R()*0.8;
      dm.position.set(x*SC,0,z*SC); dm.rotation.set((R()-0.5)*0.2,R()*6.28,(R()-0.5)*0.2); dm.scale.set(1,h,1); dm.updateMatrix(); reeds.setMatrixAt(n++,dm.matrix); REED.push([x,z]); } }
  reeds.count=n; })();
G.add(reeds);
// coroplast pines: five crossed pairs on the island, eight in the dead strip north of the pine lane
function tier(g,cx,y0,tw,th){ g.beginPath(); g.moveTo(cx-tw,y0); g.lineTo(cx,y0-th); g.lineTo(cx+tw,y0); for(var j=7;j>=0;j--) g.lineTo(cx-tw+tw*2*j/8,y0-(j%2?5:0)); g.closePath(); }
function pine(g,cx,by,h,w,col){ g.fillStyle=col; g.fillRect(cx-w*0.035,by-h*0.14,w*0.07,h*0.14);
  for(var k=0;k<5;k++){ tier(g,cx,by-h*0.1-k*h*0.17,w*(1-k*0.18)/2,h*0.3); g.fill(); } }
var pineTex=new THREE.CanvasTexture(cv(128,256,function(g){ g.fillStyle='#4a3020'; g.fillRect(58,206,12,50);
  for(var k=0;k<6;k++){ tier(g,64,222-k*34,60-k*9,64); g.fillStyle=k%2?'#1b3a24':'#173220'; g.fill(); g.strokeStyle='#3f6f42'; g.lineWidth=3; g.stroke(); } }));
var pineMat=new THREE.MeshLambertMaterial({map:pineTex,alphaTest:0.5,side:THREE.DoubleSide,emissive:0xffffff,emissiveMap:pineTex,emissiveIntensity:0.3});
var PP=ISP.map(function(p){ return [p[0],p[1],1]; });
(function(){ var tries=0, lane=[];
  while(lane.length<8 && tries++<3000){ var x=383+R()*53, z=253+R()*22, ok=droute(x,z)>=19 && dKD(x,z)<=-31 && Math.abs(x-405)>=16;
    for(var k=0;ok&&k<lane.length;k++) if(Math.hypot(x-lane[k][0],z-lane[k][1])<(tries<1500?7:3)) ok=false;
    if(ok) lane.push([x,z,0.85+R()*0.15]); }
  PP=PP.concat(lane); })();
var pines=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.7,2.3),pineMat,PP.length*2);
PP.forEach(function(p,k){ var a=PI/4+(R()-0.5)*0.3; for(var j=0;j<2;j++){ dm.position.set(p[0]*SC,1.15*p[2],p[1]*SC); dm.rotation.set(0,a+j*PI/2,0); dm.scale.set(p[2],p[2],1); dm.updateMatrix(); pines.setMatrixAt(k*2+j,dm.matrix); } });
G.add(pines);
// the pine-forest backdrop: one merged painted flat on Room 2's walls, the shore wall, KD's north face and the far shore
var bdTex=new THREE.CanvasTexture(cv(512,256,function(g,w,h){ var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#03050a'); gr.addColorStop(0.5,'#0b1519'); gr.addColorStop(0.72,'#0a1412'); gr.addColorStop(1,'#050807'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  [[34,0.66,'#11231d',50,90],[22,0.84,'#0b1a13',100,170],[13,1.02,'#050c08',190,300]].forEach(function(L){ for(var k=0;k<L[0];k++){ var x=Math.random()*w, ph=L[3]+Math.random()*(L[4]-L[3]), pw=ph*(0.36+Math.random()*0.12);
    [x,x-w,x+w].forEach(function(xx){ pine(g,xx,h*L[1],ph,pw,L[2]); }); } }); }));
bdTex.wrapS=THREE.RepeatWrapping;
var bdMat=lit(bdTex,1), bdParts=[];
function bd(x1,z1,x2,z2,ry){ var L=Math.hypot(x2-x1,z2-z1)*SC, geo=new THREE.PlaneGeometry(L,2.5,Math.ceil(L/0.5),1), uv=geo.attributes.uv, o=R(); H.scaleUV(geo,L/5,1);
  for(var k=0;k<uv.count;k++) uv.setX(k,uv.getX(k)+o); var m=new THREE.Mesh(geo,bdMat); m.position.set((x1+x2)/2*SC,1.25,(z1+z2)/2*SC); m.rotation.y=ry; bdParts.push(m); }
bd(222.1,197,222.1,360,PI/2); bd(222,197.1,330,197.1,0); bd(327.8,197,327.8,262,-PI/2);
bd(330.28,261.47,440.28,319.47,2.656);   // KD's north face (the pine lane)
bd(322,387.9,440,387.9,PI);              // the far shore, beyond the open water
G.add(H.merge(bdParts,bdMat));
// island, north end: the woodpile, the axe, the diploma
var logs=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07,0.07,0.8,8).rotateZ(PI/2),H.lam(0x5a4430),12), nl=0;
for(var ly=0;ly<4;ly++) for(var j=0;j<3;j++){ dm.position.set((276+(R()-0.5)*1.5)*SC,0.07+ly*0.121,(240+j*3.5+(ly%2)*1.75)*SC); dm.rotation.set(0,(R()-0.5)*0.12,0); dm.scale.set(0.9+R()*0.2,1,1); dm.updateMatrix(); logs.setMatrixAt(nl++,dm.matrix); }
G.add(logs);
var axe={on:false,n:0,t:0,g:H.group(265,236,0,G)};
(function(){ var hd=new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.02,0.78,6),H.lam(0x6a4e30)); hd.position.y=0.39; axe.g.add(hd);
  var hh=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.1,0.17),M.metal); hh.position.set(0,0.74,0.05); axe.g.add(hh); axe.g.rotation.x=0.32; })();   // leaning back on the top log

// ---------- printed art: one atlas, one merged mesh ----------
var PARTY=H.party||'GUEST', CARD='AMERICAN RED CROSS · HOME SERVICE · PARTY OF '+PARTY+' · ACCOUNTED FOR';
var AT=1024, RG={P:[0,0,256,320],D:[264,0,320,240],S:[592,0,432,216],C:[264,248,256,158],F:[528,224,128,282],I:[664,224,256,192],W:[[0,328,256,61],[0,400,256,61],[0,472,256,61]],L:[]};
for(i=0;i<11;i++) RG.L.push([i*72,560,64,64]);
function region(g,r,fn){ g.save(); g.beginPath(); g.rect(r[0],r[1],r[2],r[3]); g.clip(); g.translate(r[0],r[1]); g.textAlign='center'; g.textBaseline='middle'; fn(g,r[2],r[3]); g.restore(); }
function grain(g,w,h,n,col){ for(var k=0;k<n;k++){ g.fillStyle=col; g.fillRect(0,Math.random()*h,w,1); } }
var atlasC=cv(AT,AT,function(g){ g.fillStyle='#000'; g.fillRect(0,0,AT,AT);
  region(g,RG.P,function(g){ g.fillStyle='#1a140e'; g.fillRect(0,0,256,320);   // her 1875 portrait (placeholder in the lobby's style: sepia oval, hair 'curls')
    var gr=g.createRadialGradient(128,140,10,128,140,130); gr.addColorStop(0,'#caa97a'); gr.addColorStop(0.62,'#8a6c48'); gr.addColorStop(1,'#1a140e');
    g.save(); g.beginPath(); g.ellipse(128,145,104,132,0,0,PI*2); g.clip(); g.fillStyle=gr; g.fillRect(0,0,256,290);
    g.fillStyle='#2e2016'; g.beginPath(); g.ellipse(128,306,104,80,0,0,PI*2); g.fill(); g.fillStyle='#3a2a1c'; g.fillRect(113,188,30,44);
    g.fillStyle='#e0cfa8'; g.fillRect(112,222,32,9); g.fillStyle='#6a4a2a'; g.beginPath(); g.arc(128,240,6,0,7); g.fill();
    g.fillStyle='#b8966a'; g.beginPath(); g.ellipse(128,150,33,43,0,0,PI*2); g.fill();
    g.fillStyle='#2a1c10'; g.beginPath(); g.ellipse(128,118,40,24,0,PI,0); g.fill();
    for(var k=0;k<11;k++){ var a=PI+k*PI/10; g.beginPath(); g.arc(128+Math.cos(a)*37,121+Math.sin(a)*28,9,0,7); g.fill(); }
    for(var s=-1;s<=1;s+=2) for(k=0;k<5;k++){ g.beginPath(); g.arc(128+s*(38+(k%2)*3),128+k*14,8,0,7); g.fill(); }
    g.fillStyle='#4a3522'; g.beginPath(); g.ellipse(115,146,5,2.5,0,0,7); g.fill(); g.beginPath(); g.ellipse(141,146,5,2.5,0,0,7); g.fill(); g.fillRect(124,173,8,2); g.restore();
    g.fillStyle='#2a2016'; g.fillRect(0,290,256,28); g.fillStyle='#d9b76a'; fit(g,'CAROLINE HUBBARD · 1875',128,305,240,16,'bold');
    g.fillStyle='rgba(217,183,106,0.7)'; fit(g,'Photograph: Bentley Historical Library BL003635 (placeholder)',128,283,236,8); });
  region(g,RG.D,function(g,w,h){ g.fillStyle='#e9dfc2'; g.fillRect(0,0,w,h); grain(g,w,h,40,'rgba(120,90,40,0.06)');   // the 1876 diploma
    g.strokeStyle='#7a5a2a'; g.lineWidth=6; g.strokeRect(10,10,w-20,h-20); g.lineWidth=1.5; g.strokeRect(19,19,w-38,h-38);
    g.fillStyle='#2a1c10'; fit(g,'UNIVERSITY OF MICHIGAN',w/2,54,270,24,'bold'); fit(g,'MASTER OF SCIENCE',w/2,98,260,21,'italic');
    fit(g,'CAROLINE HUBBARD',w/2,140,270,27,'bold'); fit(g,'1876',w/2,180,120,24);
    g.fillStyle='#8a1a18'; g.beginPath(); g.arc(w-60,h-48,17,0,7); g.fill(); g.fillRect(w-68,h-34,5,20); g.fillRect(w-56,h-34,5,20); });
  region(g,RG.S,function(g,w,h){ g.fillStyle='#3b2a1a'; g.fillRect(0,0,w,h); grain(g,w,h,60,'rgba(0,0,0,0.18)');   // the Preserve sign
    g.strokeStyle='#d9c79a'; g.lineWidth=4; g.strokeRect(10,10,w-20,h-20); g.fillStyle='#ecdfb8';
    fit(g,'KLEINSTUCK PRESERVE',w/2,50,396,34,'bold'); fit(g,'48 ACRES · GIVEN 1922',w/2,98,390,24); fit(g,'IN MEMORY OF CARL KLEINSTUCK',w/2,134,390,24); fit(g,'12,000 PINES, ARBOR DAY 1927',w/2,170,390,24); });
  region(g,RG.C,function(g,w,h){ g.fillStyle='#efe6cf'; g.fillRect(0,0,w,h); g.fillStyle='#b04040'; g.fillRect(0,34,w,2);   // the Home Service card
    g.fillStyle='#9ab0cc'; for(var k=0;k<5;k++) g.fillRect(0,60+k*22,w,1); g.fillStyle='#2a2420';
    fit(g,'AMERICAN RED CROSS',w/2,19,236,17,'bold','Courier New,monospace'); fit(g,'HOME SERVICE',w/2,52,236,16,'bold','Courier New,monospace');
    fit(g,'PARTY OF '+PARTY,w/2,84,236,18,'bold','Courier New,monospace'); g.fillStyle='#8a1a18'; fit(g,'ACCOUNTED FOR',w/2,124,236,22,'bold','Courier New,monospace');
    g.strokeStyle='#8a1a18'; g.lineWidth=2; g.strokeRect(40,108,176,32); });
  region(g,RG.F,function(g,w,h){ g.fillStyle='#5e4a33'; g.fillRect(0,0,w,h); grain(g,w,h,50,'rgba(0,0,0,0.12)');   // the card cabinet's drawer front
    for(var r=0;r<9;r++) for(var c=0;c<3;c++){ var x=6+c*40, y=8+r*30; g.fillStyle='#6e5840'; g.fillRect(x,y,36,26); g.strokeStyle='#2e2216'; g.lineWidth=2; g.strokeRect(x,y,36,26);
      g.fillStyle='#c9a860'; g.fillRect(x+12,y+5,12,7); g.fillStyle='#efe6cf'; g.fillRect(x+13,y+6,10,5); g.fillStyle='#c9a860'; g.fillRect(x+15,y+16,6,4); } });
  region(g,RG.I,function(g,w,h){ g.fillStyle='#02040a'; g.fillRect(0,0,w,h);   // the '12,000 pines' infinity window: receding lit rows
    for(var k=11;k>=0;k--){ var s=Math.pow(0.8,k), rw=w*s, rh=h*s, x0=(w-rw)/2, y0=(h-rh)/2, a=Math.max(0.12,1-k*0.075);
      g.fillStyle='rgba(8,12,22,'+a+')'; g.fillRect(x0,y0,rw,rh);
      var col='rgb('+Math.round(18+40*a)+','+Math.round(40+70*a)+','+Math.round(28+40*a)+')';
      for(var p=0;p<10;p++) pine(g,x0+rw*(p+0.5)/10,y0+rh,rh*0.42,rw/10*1.25,col);
      g.fillStyle='rgba(255,214,140,'+a+')'; var d=Math.max(1,2.4*s);
      for(p=0;p<18;p++){ g.fillRect(x0+rw*p/18,y0+1,d,d); g.fillRect(x0+rw*p/18,y0+rh-d-1,d,d); }
      for(p=0;p<12;p++){ g.fillRect(x0+1,y0+rh*p/12,d,d); g.fillRect(x0+rw-d-1,y0+rh*p/12,d,d); } } });
  RG.W.forEach(function(r,k){ region(g,r,function(g,w,h){ g.fillStyle='#2a2016'; g.fillRect(0,0,w,h); grain(g,w,h,20,'rgba(0,0,0,0.25)');   // the wrong names
    g.strokeStyle='#6a5a40'; g.lineWidth=3; g.strokeRect(3,3,w-6,h-6); g.fillStyle='#e0d2a8'; fit(g,LAN[k][2],w/2,h/2+2,230,36,'bold'); }); });
  RG.L.forEach(function(r,k){ region(g,r,function(g,w,h){ g.fillStyle='#080706'; g.fillRect(0,0,w,h); g.strokeStyle='#8a7a60'; g.lineWidth=3;   // the true letters
    g.beginPath(); g.arc(32,32,28,0,7); g.stroke(); g.fillStyle='#ffffff'; g.font='bold 42px Georgia,serif'; g.fillText(WORD[k],32,35); }); }); });
var atlasTex=new THREE.CanvasTexture(atlasC); atlasTex.anisotropy=4;
function qm(w,h,x,y,z,ry,rx,r){ var geo=new THREE.PlaneGeometry(w,h), uv=geo.attributes.uv, u0=r[0]/AT, u1=(r[0]+r[2])/AT, v0=1-(r[1]+r[3])/AT, v1=1-r[1]/AT;
  for(var k=0;k<uv.count;k++) uv.setXY(k,u0+uv.getX(k)*(u1-u0),v0+uv.getY(k)*(v1-v0));
  var m=new THREE.Mesh(geo); m.position.set(x*SC,y,z*SC); m.rotation.order='YXZ'; m.rotation.set(rx||0,ry||0,0); return m; }
var prints=[qm(0.45,0.56,285,1.6,197.35,0,0,RG.P), qm(0.5,0.38,276,0.57,237,PI,-0.25,RG.D), qm(0.9,0.45,222.3,1.5,338,PI/2,0,RG.S),
  qm(0.26,0.16,CABX-KSN[0]*1.5,1.103,CABZ-KSN[1]*1.5,RYKS,-PI/2,RG.C), qm(0.5,1.1,CABX+KSN[0]*5.65,0.55,CABZ+KSN[1]*5.65,RYKS,0,RG.F)];
LAN.forEach(function(l,k){ prints.push(qm(0.5,0.12,l[0]+KSN[0]*1.4,1.0,l[1]+KSN[1]*1.4,RYKS,0,RG.W[k])); });
G.add(H.merge(prints,lit(atlasTex,0.5)));
var winM=qm(0.8,0.6,405,1.5,247.3,0,0,RG.I); winM.material=new THREE.MeshBasicMaterial({map:atlasTex}); G.add(winM);   // tier 3: the infinity-mirror window
var gilt=[]; [[0,0.3,0.53,0.04],[0,-0.3,0.53,0.04],[-0.245,0,0.04,0.64],[0.245,0,0.04,0.64]].forEach(function(f){ gilt.push(H.box(f[2],f[3],0.03,M.brass,285+f[0]/SC,1.6+f[1],197.5)); });
G.add(H.merge(gilt,H.lam(0xb8923a)));
// the eleven true letters: one mesh, vertex colors light them one by one
var letters=H.merge(LX.map(function(x,k){ return qm(0.14,0.14,x+KSN[0]*1.3,1.0,LZ[k]+KSN[1]*1.3,RYKS,0,RG.L[k]); }),new THREE.MeshBasicMaterial({map:atlasTex,vertexColors:true}));
var lcol=new THREE.BufferAttribute(new Float32Array(66*3),3); letters.geometry.setAttribute('color',lcol); G.add(letters);
var tc=new THREE.Color();
function setLetter(k,hex){ tc.setHex(hex); for(var v=k*6;v<k*6+6;v++) lcol.setXYZ(v,tc.r,tc.g,tc.b); lcol.needsUpdate=true; }
// glow boxes: the three wrong-name lanterns and the woodcutter's lantern on the pile
var gb=LAN.map(function(l){ return H.box(0.18,0.26,0.18,railMat,l[0],1.3,l[1]); }); gb.push(H.box(0.12,0.18,0.12,railMat,283,0.59,244));
var glowBoxes=H.merge(gb,new THREE.MeshBasicMaterial({vertexColors:true})), gcol=new THREE.BufferAttribute(new Float32Array(4*36*3),3), gI=[-1,-1,-1];
glowBoxes.geometry.setAttribute('color',gcol); G.add(glowBoxes);
function setGlow(k,r,g,b){ for(var v=k*36;v<k*36+36;v++) gcol.setXYZ(v,r,g,b); gcol.needsUpdate=true; }
function lantern(k,I){ if(gI[k]===I) return; gI[k]=I; var b=Math.min(1,0.3+I); setGlow(k,1.0*b,0.8*b,0.45*b); halo(k,I); }
setGlow(3,1.0,0.62,0.26);
// the Red Cross Home Service card cabinet, just beyond KS
H.box(0.5,1.1,0.45,H.lam(0x5a4a3a),CABX,0.55,CABZ,RYKS,G); var drawer=H.box(0.26,0.13,0.4,H.lam(0x6e5840),CABX,1.005,CABZ,RYKS,G);
(function(){ var cu=[Math.cos(RYKS),-Math.sin(RYKS)], cc=[[-1,-1],[1,-1],[1,1],[-1,1]].map(function(s){ return [CABX+cu[0]*6.25*s[0]+KSN[0]*5.625*s[1],CABZ+cu[1]*6.25*s[0]+KSN[1]*5.625*s[1]]; });
  for(var k=0;k<4;k++) H.seg(cc[k][0],cc[k][1],cc[(k+1)%4][0],cc[(k+1)%4][1]); })();
function drawerAt(e){ var d=(0.03+0.3*e)/SC; drawer.position.set((CABX+KSN[0]*d)*SC,1.005,(CABZ+KSN[1]*d)*SC); }
drawerAt(0);
// the Warden (invented staff): a ghillie-suited groundskeeper among the island's pines
var lanternMat=H.glow(0xffa040,0), warden=H.figure(0x12301c,0x2a3a28,G), wLamp, armG, gm=H.lam(0x2c3a22);
(function(){ warden.children[0].visible=false;   // the ghillie cloak is the body
  var cg=new THREE.ConeGeometry(0.3,1.75,12,6), p=cg.attributes.position;   // at most 0.34 m across the hem, so he stays inside the island's rails
  for(var k=0;k<p.count;k++){ var y=p.getY(k); if(y<0.87){ var f=1+(R()-0.5)*0.24; p.setX(k,p.getX(k)*f); p.setZ(k,p.getZ(k)*f); p.setY(k,y+(R()-0.5)*0.06); } } cg.computeVertexNormals();
  var cone=new THREE.Mesh(cg,gm); cone.position.y=0.875; warden.add(cone);
  armG=new THREE.Group(); armG.position.set(0.17,1.3,0.02); warden.add(armG);   // shoulder pivot: the arm hangs, then thrusts the lantern at you
  var arm=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.03,0.44,6),gm); arm.position.y=-0.22; armG.add(arm);
  wLamp=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.18,0.12),lanternMat); wLamp.position.y=-0.52; armG.add(wLamp);
  warden.add(H.merge([-1,1].map(function(s){ var e=new THREE.Mesh(new THREE.SphereGeometry(0.014,8,6)); e.position.set(s*0.045,1.53,0.118); return e; }),lanternMat)); })();   // eyes that catch the lantern
function wardenHome(){ warden.position.set(276*SC,0,284*SC); warden.rotation.y=PI/2; armG.rotation.x=-0.15; }
wardenHome();

// ---------- 7. wisps ----------
var radial=new THREE.CanvasTexture(cv(64,64,function(g){ var gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.3,'rgba(255,255,255,0.65)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); }));
var wpos=new Float32Array(21), wgeo=new THREE.BufferGeometry(); wgeo.setAttribute('position',new THREE.BufferAttribute(wpos,3));
var wisps=new THREE.Points(wgeo,new THREE.PointsMaterial({size:0.12,map:radial,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,color:0x9fffd0}));
wisps.frustumCulled=false; G.add(wisps);
var hpos=new Float32Array(12), hcol=new Float32Array(12), hgeo=new THREE.BufferGeometry();   // lantern halos
LAN.concat([[283,244]]).forEach(function(l,k){ hpos[k*3]=l[0]*SC; hpos[k*3+1]=k<3?1.3:0.6; hpos[k*3+2]=l[1]*SC; });
hgeo.setAttribute('position',new THREE.BufferAttribute(hpos,3)); hgeo.setAttribute('color',new THREE.BufferAttribute(hcol,3));
var halos=new THREE.Points(hgeo,new THREE.PointsMaterial({size:1.2,map:radial,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
halos.frustumCulled=false; G.add(halos);
function halo(k,I){ hcol[k*3]=0.85*I; hcol[k*3+1]=0.55*I; hcol[k*3+2]=0.2*I; hgeo.attributes.color.needsUpdate=true; }
halo(3,0.45);
var WP=[]; for(i=0;i<6;i++){ var bg=i<3; WP.push({cx:bg?276:385,cz:bg?255:350,ax:(bg?1.0:1.6)/SC,az:(bg?1.2:1.0)/SC,f:[0.05+R()*0.07,0.05+R()*0.07,0.05+R()*0.07],p:[R()*6.28,R()*6.28,R()*6.28]}); }
var lead={x:390,z:340}, CAST=[1.5,0.6];
function wreg(x,z){ return x<329?0:(dKD(x,z)>=0?1:2); }   // 0 Room 2 and the shore lane, 1 the boardwalk and the water, 2 the pine lane
function wok(x,z,r){ var d=dKD(x,z); return r===0?(x>224&&x<328&&z>199&&z<387):r===1?(x>328&&x<438&&z<387&&d>2):(x>332&&x<438&&z>251&&d<-2); }

// ---------- 3. lights (3 of 3) ----------
var moonL=H.plight(290,265,2.45,0x5f8fb0,0.4,9);    // cold moonlight over the bog room and the boardwalk's start
var wispL=H.plight(390,340,1.3,0x9fffd0,0.5,3.5);   // rides the lead wisp every frame
var lanternL=H.plight(282,282,1.3,0xffa040,0,3);    // the Warden's lantern

// ---------- 4. grilles, 5. lines ----------
H.grille('shore',222.3,2.2,352,Math.PI/2); H.grille('bog',285,2.3,197.3,0);
H.grille('boardwalk',384.7,2.2,291.5,-0.485);   // on KD's south face
H.grille('pines',400,2.3,247.3,0);
H.addLines({
  K1:{at:'shore',t:'Caroline Hubbard came from Kalamazoo in the fall of 1871, one of the first women Michigan admitted. When fire damaged the family paper mill, her father declared, ‘Little Carrie shall go to the University if I have to chop wood to keep her there!’'},
  K2:{at:'bog',t:'In 1922 she gave forty-eight acres of Kalamazoo marsh and woods in memory of her husband, Carl, who had dug its peat to see whether it would burn. Stay on the boards, please; a bog keeps whatever it is given.'},
  K3:{at:'bog',t:'She took her Master of Science in 1876, the first this University granted to a woman. Whether her father ever chopped the wood, history does not say.'},
  K4:{at:'bog',t:'On Arbor Day of 1927 students planted twelve thousand pines on her land. Not all of them have stayed where they were put.'},
  K2b:{at:'boardwalk',t:'In 1949 the Board of Governors wrote her down as ‘Kleinstadt,’ and people have been misspelling her ever since. Those lanterns are trying a few more; follow only the true letters.'},
  K5:{at:'boardwalk',t:'In the Great War she ran the Red Cross Home Service and built a card catalog that outlived her; there is a card in it for your party. She also worked for the vote and made the first large gift to our Women’s League, and Dr. Hinsdale is ready to examine you.'},
  R1:{at:'pines',t:'Every one of my guests of honor came here to learn. I always said the early women students came ‘because they were fundamentally interested in obtaining an education.’'}
});
H.ambience({kind:'noise',type:'bandpass',freq:3800,gain:0.02,x:300,z:300});   // insects
H.ambience({kind:'noise',freq:500,gain:0.025,x:400,z:270});                   // wind in the pines

// ---------- 7. the bog remembers your footsteps ----------
function splash(x,z,v){ var c=Math.round((x-222)/108*N), r=Math.round((z-197)/108*N);
  for(var dy=-1;dy<=1;dy++) for(var dx=-1;dx<=1;dx++){ var cc=c+dx, rr=r+dy; if(cc>0&&cc<N-1&&rr>0&&rr<N-1) ra[rr*N+cc]=v; } }
function simStep(){ for(var y=1;y<N-1;y++){ var o=y*N; for(var x=1;x<N-1;x++){ var k=o+x; rb[k]=((ra[k-1]+ra[k+1]+ra[k-N]+ra[k+N])/2-rb[k])*0.985; } } var s=ra; ra=rb; rb=s; }
function paint(){ for(var k=0,j=0,b=0;k<NN;k++,j+=4,b+=3){ var s=((ra[k+1]||0)-(ra[k-1]||0))*0.6/80;
    if(s>0){ if(s>1) s=1; px[j]=base[b]+s*159; px[j+1]=base[b+1]+s*255; px[j+2]=base[b+2]+s*208; }
    else { var f=1+s*2; if(f<0.3) f=0.3; px[j]=base[b]*f; px[j+1]=base[b+1]*f; px[j+2]=base[b+2]*f; } px[j+3]=255; }
  bctx.putImageData(img,0,0); bogTex.needsUpdate=true; }
paint();

// ---------- 6. show, zones and the Warden ----------
var T=0, duck=0, seen3=false, frogT=2, last=null, simAcc=0, frames=0, dripT=1.5, lw=[-9,-9,-9], cabT=-1, cardT=0, qT=0, stageEl=document.getElementById('stage');
var lit8={armed:false,pulse:false,on:[]}, ward={st:'idle',fired:false,rearm:0,tw:null,tw2:null};
// the Dean's lines play in order and never pile up: each waits until she is quiet and the guest has reached its place (or gone past it)
var sq={run:false,i:0,reach:0,t:0}, STG=[[222,240,262,305],[240,197,300,234],[290,205,330,258],[330,280,382,325],[388,300,446,362]];   // bog west, north boards, east lane, boardwalk, cabinet to the 1912 door
function chop(g){ H.sfx.noise(.08,1200,g,{x:276,z:244}); H.sfx.tone(90,.15,.6*g,{x:276,z:244});
  axe.g.rotation.x=0.2; H.tween(0.25,function(p){ axe.g.rotation.x=0.2+0.12*p; }); }
function Z(b,when,enter){ var z=H.zone({x1:b[0],z1:b[1],x2:b[2],z2:b[3],once:true,when:when,enter:enter}); H.nzones.push(z); return z; }
function wardenScare(){ if(ward.st!=='idle') return; ward.fired=true; ward.st='out'; ward.rearm=20;
  ward.tw=H.tween(0.2,function(p){ warden.position.set((276+5*p)*SC,0,(284-9*p)*SC); armG.rotation.x=-0.15-0.6*p; },function(){ H.keepAway(warden,0.6); });   // his mark (281,275): the cloak stays inside the rail at x=290
  H.lightTo(lanternL,1.2,0.15); lanternMat.emissiveIntensity=1;
  H.sfx.sting({x:281,z:275}); H.sfx.noise(.05,4000,.6,{x:281,z:275}); H.scare('STAY ON THE BOARDS!',1.6);
  ward.tw2=H.after(1.5,function(){ ward.st='back'; var sx=warden.position.x, sz=warden.position.z;
    ward.tw=H.tween(1,function(p){ var e=p*p*(3-2*p); warden.position.set(sx+(276*SC-sx)*e,0,sz+(284*SC-sz)*e); lanternMat.emissiveIntensity=1-p; lanternL.intensity=1.2*(1-p); armG.rotation.x=-0.75+0.6*e; },
      function(){ ward.st='idle'; wardenHome(); lanternL.intensity=0; lanternMat.emissiveIntensity=0; }); }); }
function cabinet(){ cabT=T; H.tween(0.6,function(p){ drawerAt(1-(1-p)*(1-p)); }); H.sfx.noise(0.55,700,0.3,{type:'bandpass',q:0.8,x:CABX,z:CABZ}); H.sfx.tone(140,0.12,0.2,{x:CABX,z:CABZ,delay:0.58});
  cardT=5; H.cap(CARD); H.line('K5'); }
var SEQ=[function(){ H.line('K2'); },
  function(){ axe.on=false; chop(0.8); duck=3; H.after(0.6,function(){ H.line('K3'); }); },   // the last and loudest chop, then silence
  function(){ H.line('K4'); },
  function(){ H.line('K2b'); lit8.pulse=true; },
  cabinet];
var zW=Z([290,255,330,300],function(){ return sq.run && sq.reach>=3 && H.heading(0,1); },wardenScare);   // re-arms 20 s after the guest has left the box (see the updater)
var zR1=Z([360,250,440,300],function(){ return !!H.stay.hinsdaleDone && seen3; },function(){ H.line('R1'); });
var ZS=[zW,zR1];
H.klein={door:d1876,zones:ZS,warden:ward,axe:axe,seq:sq};   // test hook (HAUNT.H.klein)

reset=function(full){ if(full) d1876.close(); axe.on=false; axe.n=0; axe.t=0; axe.g.rotation.x=0.32;
  lit8.armed=false; lit8.pulse=false; for(var k=0;k<11;k++){ lit8.on[k]=false; setLetter(k,0x222222); } gI=[-1,-1,-1]; for(k=0;k<3;k++) lantern(k,0.3);
  drawerAt(0); if(ward.tw) ward.tw.dead=true; if(ward.tw2) ward.tw2.dead=true; ward.st='idle'; ward.fired=false; ward.rearm=0;
  wardenHome(); lanternMat.emissiveIntensity=0; lanternL.intensity=0;
  ra.fill(0); rb.fill(0); last=null; paint();
  if(cardT>0 && stageEl && stageEl.textContent===CARD) H.cap('');
  sq.run=false; sq.i=0; sq.reach=0; sq.t=0; cabT=-1; cardT=0; qT=0;
  ZS.forEach(function(z){ z.fired=false; }); seen3=false; duck=0; lw=[-9,-9,-9]; H.stay.kleinDone=false; };
reset(false);
H.resets.push(function(){ reset(true); });
show=H.cue([[0,function(){ reset(false); sq.run=true; H.line('K1'); axe.on=true; axe.n=0; axe.t=0; }]]);   // the door stays open: reset(false) leaves it alone

H.onUpdate(function(dt,t){ T+=dt; var p=H.player(), here=H.inBox(218,190,445,392);
  moonL.intensity=here?0.4:0; wispL.intensity=here?0.5:0;
  if(H.inBox(445,245,530,390)) seen3=true;
  if(zW.fired && ward.st==='idle'){ if(H.inBox(290,255,330,300)) ward.rearm=20; else if((ward.rearm-=dt)<=0) zW.fired=false; }
  // the Dean's lines, in order; Suite 1912 opens only once she has finished
  if(sq.run){ var bw=dKD(p.x,p.z)>0; for(var s=sq.reach;s<5;s++) if(H.inBox(STG[s][0],STG[s][1],STG[s][2],STG[s][3]) && (s<3 || bw)) sq.reach=s+1;
    if(sq.reach>=4) lit8.armed=true;
    qT=H.quiet()?qT+dt:0;
    if(sq.i<5 && sq.reach>sq.i && qT>0.6 && T-sq.t>1.5){ sq.t=T; SEQ[sq.i++](); }
    if(sq.i>=5 && !H.stay.kleinDone && T-cabT>1 && qT>0) H.stay.kleinDone=true; }
  if(cardT>0){ cardT-=dt; if(stageEl){ if(cardT<=0){ if(stageEl.textContent===CARD) H.cap(''); } else if(!stageEl.textContent) H.cap(CARD); } }   // the card outlasts the 1912 reader's notice
  // the axe: her father keeping his promise
  if(axe.on && !d1876.isOpen) axe.on=false;
  if(axe.on){ axe.t+=dt; if(axe.t>=1.4){ axe.t-=1.4; chop(Math.min(0.35,0.08+0.015*axe.n)); axe.n++; } }
  if(!G.visible) return;
  // the Warden holds his ground at 0.6 m and watches you
  if(ward.st!=='idle'){ if(ward.st==='out'){ H.keepAway(warden,0.6); var hp=H.headPos(); warden.rotation.y=Math.atan2(hp.x-warden.position.x,hp.z-warden.position.z); }
    if(lanternL.intensity>0){ wLamp.getWorldPosition(V3); lanternL.position.copy(V3); } }
  // true letters and wrong lanterns
  if(lit8.armed && H.inBox(322,280,445,360)) for(var k=0;k<11;k++) if(!lit8.on[k] && p.x>LX[k]-6){ lit8.on[k]=true; setLetter(k,0xfff2c8); H.sfx.tone(1320,0.25,0.025,{x:LX[k],z:LZ[k]}); }
  for(k=0;k<3;k++){ lantern(k,lit8.pulse?0.3+0.5*H.flick(t+k*0.7,0.5,0.6):0.3);
    if(H.started() && H.near(LAN[k][0],LAN[k][1],2.5) && T-lw[k]>4){ lw[k]=T; H.sfx.whisper({x:LAN[k][0],z:LAN[k][1]}); } }
  // frogs
  if(duck>0) duck-=dt; else if(H.started() && H.inBox(222,197,440,390) && REED.length){ frogT-=dt; if(frogT<=0){ frogT=1.5+Math.random()*1.5; var rd=REED[(Math.random()*REED.length)|0]; H.sfx.tone(900,.12,.04,{glide:600,x:rd[0],z:rd[1]}); } }
  // wisps: three over the bog, three over the open water, and the lead wisp between you and the nearest wrong lantern
  for(k=0;k<6;k++){ var w=WP[k]; wpos[k*3]=(w.cx+w.ax*Math.sin(6.283*w.f[0]*t+w.p[0]))*SC; wpos[k*3+1]=1.35+0.45*Math.sin(6.283*w.f[2]*t+w.p[2]); wpos[k*3+2]=(w.cz+w.az*Math.sin(6.283*w.f[1]*t+w.p[1]))*SC; }
  var pr=wreg(p.x,p.z), fx, fz, tx=410, tz=262, bd2=1e9;
  if(!(dKD(p.x,p.z)<0 && p.x>330)) LAN.forEach(function(l){ var d=Math.hypot(l[0]-p.x,l[1]-p.z); if(d<bd2){ bd2=d; tx=l[0]; tz=l[1]; } });   // on the pine lane it lingers in the pines instead
  var td=Math.hypot(tx-p.x,tz-p.z)||1; fx=p.x+(tx-p.x)/td*0.6/SC; fz=p.z+(tz-p.z)/td*0.6/SC;   // facing a wall: it waits 0.6 m off toward its lantern
  for(k=0;k<2;k++){ var ax=p.x+Math.sin(p.yaw)*CAST[k]/SC, az=p.z+Math.cos(p.yaw)*CAST[k]/SC; if(wok(ax,az,pr) || (pr<2 && wok(ax,az,1-pr))){ fx=ax; fz=az; break; } }   // 1.5 m ahead, or 0.6 m when a wall is in the way
  var e=0.5+0.5*Math.sin(0.4*t); lead.x=fx+(tx-fx)*e; lead.z=fz+(tz-fz)*e;
  wpos[18]=lead.x*SC; wpos[19]=1.3; wpos[20]=lead.z*SC; wgeo.attributes.position.needsUpdate=true; wispL.position.set(lead.x*SC,1.3,lead.z*SC);
  waterTex.offset.x+=dt*0.012; waterTex.offset.y+=dt*0.005;
  // ripples: only while you are near the bog
  if(!H.inBox(215,190,340,315)) return;
  if(H.inBox(222,197,330,305) && (!last || Math.hypot(p.x-last[0],p.z-last[1])*SC>0.15)){ splash(p.x,p.z,-220); last=[p.x,p.z]; }
  dripT-=dt; if(dripT<=0){ dripT=1.5; if(lead.x>222&&lead.x<330&&lead.z>197&&lead.z<305) splash(lead.x,lead.z,-160); }
  simAcc=Math.min(simAcc+dt,0.1); var n=0; while(simAcc>=1/60 && n<3){ simStep(); simAcc-=1/60; n++; }
  if(n && (!H.renderer.xr.isPresenting || (++frames)%2===0)) paint();
});

// ---------- 8. station ----------
H.onBegin(function(){ H.stations.forEach(function(s){ if(s.n===3){ s.name='Suite 1876 · Kleinstueck'; s.desc='the Preserve · stay on the boards · follow only the true letters'; } }); });
})();
