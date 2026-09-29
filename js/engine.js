/* Hotel Alice Lloyd: walkthrough engine (Three.js r128 + WebXR).
   Content scripts build the hotel through window.HOTEL, then index.html calls HOTEL.run().
   Plan coordinates (x, z) are flow-map "svg units" (HOTEL.SC meters each); heights and sizes are meters. */
(function(){
'use strict';
var THREE = window.THREE;
var H = window.HOTEL = {};
if (!THREE){ H.failed = true; return; }

// ---------- constants ----------
var SC = H.SC = 0.04;
var WALL_H = H.WALL_H = 2.72, CURT_H = H.CURT_H = 2.55, EYE = H.EYE = 1.6, PR = 0.36;   // curtains stop ~0.15 m short of the ceiling, as in 2025
H.budget = {lights:24, calls:250, tris:100000};   // Quest 2 at 72 fps, both eyes

var canvas = document.getElementById('three');
var renderer = H.renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
var scene = H.scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
scene.fog = new THREE.FogExp2(0x05060a, 0.052);
H.fogDensity = 0.052;
var camera = H.camera = new THREE.PerspectiveCamera(72, 1, 0.05, 60);
var rig = H.rig = new THREE.Group(); rig.add(camera); scene.add(rig);   // XR moves the rig; desktop leaves it at the origin
renderer.xr.enabled = true;
H.ambient = new THREE.AmbientLight(0x323a52, 0.34); scene.add(H.ambient);
var ovLight = new THREE.HemisphereLight(0xfff4e0, 0x202028, 0); scene.add(ovLight);   // bird's-eye only
var houseLight = new THREE.HemisphereLight(0xf4f1e8, 0x3a362e, 0); scene.add(houseLight);   // house-lights mode only

// ---------- procedural textures (shared canvases; meshes scale their UVs to real-world size) ----------
function canvasTex(w,h,draw){ var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  var t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; }
H.canvasTex = canvasTex;
function speckle(g,w,h,n,a){ for(var i=0;i<n;i++){ g.fillStyle='rgba(0,0,0,'+(Math.random()*a)+')'; g.fillRect(Math.random()*w,Math.random()*h,2,2); } }
H.tex = {
  // painted CMU, running bond: 4 courses of 0.203 m blocks; one tile = 1.625 x 0.8125 m
  cmu: canvasTex(512,256,function(g,w,h){ g.fillStyle='#e9e5dc'; g.fillRect(0,0,w,h); g.fillStyle='#bdb6a7';
    for(var r=0;r<4;r++){ g.fillRect(0,r*64,w,3); for(var c=0;c<5;c++) g.fillRect((c*128+(r%2)*64)%w,r*64,3,64); } speckle(g,w,h,2600,0.05); }),
  // hanging sheeting: soft vertical folds and a seam per tile; one tile = 1.4 x 2.8 m (tint with the material colour)
  folds: canvasTex(256,256,function(g,w,h){ for(var x=0;x<w;x++){ var v=200+40*Math.sin(x/w*Math.PI*8)+14*Math.sin(x/w*Math.PI*21); g.fillStyle='rgb('+(v|0)+','+(v|0)+','+(v|0)+')'; g.fillRect(x,0,1,h); }
    g.fillStyle='rgba(0,0,0,0.35)'; g.fillRect(w-3,0,3,h); }),
  // VCT floor: 2 x 2 tiles of 0.305 m; one tile = 0.61 m
  vct: canvasTex(256,256,function(g,w,h){ var c=['#8a8373','#807969','#8d8676','#847d6d']; for(var i=0;i<4;i++){ g.fillStyle=c[i]; g.fillRect((i%2)*128,(i>>1)*128,128,128); }
    speckle(g,w,h,5000,0.12); g.fillStyle='#5f594e'; g.fillRect(0,0,w,2); g.fillRect(0,128,w,2); g.fillRect(0,0,2,h); g.fillRect(128,0,2,h); })
};
H.tex.cmu.size=[1.625,0.8125]; H.tex.folds.size=[1.4,2.8]; H.tex.vct.size=[0.61,0.61];
function scaleUV(geo,sx,sy){ var uv=geo.attributes.uv; for(var i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*sx,uv.getY(i)*sy); uv.needsUpdate=true; return geo; }
H.scaleUV = scaleUV;

// ---------- materials ----------
function lam(color,o){ o=o||{}; o.color=color; return new THREE.MeshLambertMaterial(o); }
H.lam = lam;
H.glow = function(color,intensity,o){ o=o||{}; o.color=color; o.emissive=color; o.emissiveIntensity=intensity==null?0.8:intensity; return new THREE.MeshLambertMaterial(o); };
H.mat = {
  wall: lam(0xcbbf9f,{map:H.tex.cmu}), wallCorr: lam(0xb8996b,{map:H.tex.cmu}), wallBack: lam(0xd9d6ce,{map:H.tex.cmu}),
  curt: lam(0x1b1c22,{map:H.tex.folds,side:THREE.DoubleSide}), curtN: lam(0x8a1418,{map:H.tex.folds,side:THREE.DoubleSide}),
  metal: lam(0x6f7680), dark: lam(0x141317), column: lam(0xe8e6df), door: lam(0x6e4a2c), floor: lam(0x6a6456,{map:H.tex.vct}),
  wood: lam(0x4a3421), woodDark: lam(0x2b2119), brass: lam(0xb8873b), paper: lam(0xe8ddc2), black: lam(0x060606)
};

// ---------- geometry helpers (x,z in svg units) ----------
var solids = H.solids = [];   // collision segments in meters {x1,z1,x2,z2,off}
var map = H.map = {walls:[], curtains:[], doors:[]};   // for the minimap and bounds
function seg(x1,z1,x2,z2){ var s={x1:x1*SC,z1:z1*SC,x2:x2*SC,z2:z2*SC,off:false}; solids.push(s); return s; }
H.seg = seg;
H.gate = function(x1,z1,x2,z2){ var g=seg(x1,z1,x2,z2); g.door=true; return g; };   // a barrier that opens on cue: set .off=true to let guests through
function wallMesh(x1,z1,x2,z2,h,mat,yBase,thick){
  var dx=(x2-x1)*SC, dz=(z2-z1)*SC, len=Math.sqrt(dx*dx+dz*dz);
  var geo=new THREE.BoxGeometry(len,h,thick||0.16,Math.max(1,Math.ceil(len/0.5)),Math.ceil(h/0.7),1);   // Lambert lights per vertex: subdivide
  if(mat.map && mat.map.size) scaleUV(geo,len/mat.map.size[0],h/mat.map.size[1]);
  var m = new THREE.Mesh(geo, mat);
  m.position.set((x1+x2)/2*SC,(yBase||0)+h/2,(z1+z2)/2*SC);
  m.rotation.y = -Math.atan2(dz,dx);
  scene.add(m); return m;
}
H.wallMesh = wallMesh;
// plan-view caps: flat strips on top of walls, shown only in the bird's-eye view
var caps=new THREE.Group(); caps.visible=false; scene.add(caps); var capMats={};
function cap(x1,z1,x2,z2,color,y,w){ var dx=(x2-x1)*SC,dz=(z2-z1)*SC,len=Math.hypot(dx,dz)+(w||0.2);
  var mat=capMats[color]||(capMats[color]=new THREE.MeshBasicMaterial({color:color,fog:false}));
  var m=new THREE.Mesh(new THREE.PlaneGeometry(len,w||0.2),mat); m.rotation.order='YXZ'; m.rotation.y=-Math.atan2(dz,dx); m.rotation.x=-Math.PI/2;
  m.position.set((x1+x2)/2*SC,y+0.01,(z1+z2)/2*SC); m.userData.cap=true; caps.add(m); return m; }
H.cap2d = cap;
H.wall = function(x1,z1,x2,z2,mat){ map.walls.push([x1,z1,x2,z2]); var m=wallMesh(x1,z1,x2,z2,WALL_H,mat||H.mat.wall,0); m.userData.solid=seg(x1,z1,x2,z2); cap(x1,z1,x2,z2,'#d8cfbd',WALL_H); return m; };
H.curtain = function(x1,z1,x2,z2,mat,mapColor){ mapColor=mapColor||(mat===H.mat.curtN?'#d43d3d':'#3c6fe0'); map.curtains.push([x1,z1,x2,z2,mapColor]);
  var m=wallMesh(x1,z1,x2,z2,CURT_H,mat||H.mat.curt,0,0.03); m.userData.solid=seg(x1,z1,x2,z2); m.userData.cap=cap(x1,z1,x2,z2,mapColor,CURT_H,0.16); return m; };
// square structural column (side s meters) with collision
H.column = function(x,z,s,mat){ s=s||0.45; var h=s/2/SC, m=H.box(s,WALL_H,s,mat||H.mat.column,x,WALL_H/2,z);
  [[x-h,z-h,x+h,z-h],[x+h,z-h,x+h,z+h],[x+h,z+h,x-h,z+h],[x-h,z+h,x-h,z-h]].forEach(function(w){ seg(w[0],w[1],w[2],w[3]); map.walls.push(w); });
  cap(x-h,z,x+h,z,'#d8cfbd',WALL_H,s); return m; };
// door set into a wall: centre (x,z) on the wall face, face 's'|'n'|'e'|'w' = the direction its front looks.
// Visual only (the wall already blocks). Returns {group, leaf, plate, setPlate(lines,opts)}.
H.door = function(o){ var ry={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2}[o.face||'s'], g=H.group(o.x,o.z,ry), w=o.w||0.91, h=o.h||2.13;
  var leaf=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.04),o.mat||H.mat.door); leaf.position.set(0,h/2,0.02); g.add(leaf);
  var fm=o.frameMat||H.mat.woodDark;
  [[-w/2-0.03,h/2,0.06,h],[w/2+0.03,h/2,0.06,h],[0,h+0.03,w+0.12,0.06]].forEach(function(f){ var b=new THREE.Mesh(new THREE.BoxGeometry(f[2],f[3],0.09),fm); b.position.set(f[0],f[1],0.045); g.add(b); });
  var lever=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.025,0.05),H.mat.brass); lever.position.set(w/2-0.1,1.0,0.07); g.add(lever);
  var pm=new THREE.MeshLambertMaterial({map:H.textTexture(o.plate||[''],{w:192,h:128,fs:54,bg:'#1d1a16',fg:'#d9b76a',border:'#8a6a2a',bw:8})});
  var plate=new THREE.Mesh(new THREE.PlaneGeometry(0.15,0.1),pm); plate.position.set(w/2-0.13,1.52,0.045); g.add(plate);
  map.doors.push([o.x-(ry%Math.PI?0:w/2/SC),o.z-(ry%Math.PI?w/2/SC:0),o.x+(ry%Math.PI?0:w/2/SC),o.z+(ry%Math.PI?w/2/SC:0)]);
  return {group:g, leaf:leaf, plate:plate, setPlate:function(lines,opts){ opts=opts||{}; pm.map=H.textTexture(lines,{w:opts.w||192,h:opts.h||128,fs:opts.fs||54,bg:opts.bg||'#1d1a16',fg:opts.fg||'#d9b76a',border:opts.border||'#8a6a2a',bw:8}); pm.needsUpdate=true; }};
};
// house-lights fixtures: emissive meshes that glow only when the house lights are on (L key / left stick click)
var house={on:false,mats:[],fns:[]};
H.fixture = function(mesh){ if(house.mats.indexOf(mesh.material)<0){ mesh.material.userData.onI=mesh.material.emissiveIntensity||0.9; mesh.material.emissiveIntensity=0; house.mats.push(mesh.material); } return mesh; };
H.onHouseLights = function(fn){ house.fns.push(fn); };
H.houseLights = function(on){ house.on=on===undefined?!house.on:on; houseLight.intensity=house.on?0.62:0;
  house.mats.forEach(function(m){ m.emissiveIntensity=house.on?m.userData.onI:0; });
  scene.fog.density=overview?0.004:(house.on?0.018:H.fogDensity);
  house.fns.forEach(function(f){ f(house.on); }); return house.on; };
H.box = function(w,h,d,mat,x,y,z,ry,parent){ var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x*SC,y,z*SC); if(ry)m.rotation.y=ry; (parent||scene).add(m); return m; };
H.cyl = function(rt,rb,h,mat,x,y,z,seg,parent){ var m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||12),mat); m.position.set(x*SC,y,z*SC); (parent||scene).add(m); return m; };
H.ball = function(r,mat,x,y,z,parent){ var m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),mat); m.position.set(x*SC,y,z*SC); (parent||scene).add(m); return m; };
// a vertical plane at (x,y,z); ry=0 faces +z, PI faces -z, PI/2 faces +x, -PI/2 faces -x
H.plane = function(w,h,mat,x,y,z,ry,parent){ var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); m.position.set(x*SC,y,z*SC); m.rotation.y=ry||0; (parent||scene).add(m); return m; };
// floor/ceiling rectangle overlay (carpet runner, tile, rug, ceiling grid)
H.floorPatch = function(x1,z1,x2,z2,mat,y){ var w=Math.abs(x2-x1)*SC, d=Math.abs(z2-z1)*SC;
  var geo=new THREE.PlaneGeometry(w,d,Math.max(1,Math.ceil(w/0.5)),Math.max(1,Math.ceil(d/0.5))); if(mat.map&&mat.map.size) scaleUV(geo,w/mat.map.size[0],d/mat.map.size[1]);
  var m=new THREE.Mesh(geo,mat);
  m.rotation.x=-Math.PI/2; m.position.set((x1+x2)/2*SC,y||0.006,(z1+z2)/2*SC); scene.add(m); return m; };
H.ceilPatch = function(x1,z1,x2,z2,mat,y){ var m=H.floorPatch(x1,z1,x2,z2,mat,y||WALL_H-0.006); m.rotation.x=Math.PI/2; return m; };
H.group = function(x,z,ry,parent){ var g=new THREE.Group(); g.position.set((x||0)*SC,0,(z||0)*SC); g.rotation.y=ry||0; (parent||scene).add(g); return g; };
H.textTexture = function(lines,opts){
  opts=opts||{}; var c=document.createElement('canvas'); c.width=opts.w||512; c.height=opts.h||256;
  var g=c.getContext('2d'); g.fillStyle=opts.bg||'#efe3c8'; g.fillRect(0,0,c.width,c.height);
  if(opts.border){ g.strokeStyle=opts.border; g.lineWidth=opts.bw||14; g.strokeRect(10,10,c.width-20,c.height-20); }
  g.fillStyle=opts.fg||'#33261a'; g.textAlign='center'; g.textBaseline='middle';
  var fs=opts.fs||44, y0=c.height/2-(lines.length-1)*fs*0.62, font=opts.font||'Georgia,serif';
  for(var i=0;i<lines.length;i++){ g.font=(i===0&&opts.boldFirst?'bold ':'')+(opts.italic?'italic ':'')+fs+'px '+font; g.fillText(lines[i],c.width/2,y0+i*fs*1.24); }
  return new THREE.CanvasTexture(c);
};
// sign: lines of text on a plane; opts are textTexture opts plus {glow:0..1} for self-lit signs
H.sign = function(lines,opts,w,h,x,y,z,ry,parent){
  opts=opts||{}; var t=H.textTexture(lines,opts);
  var mat=opts.glow ? new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(opts.glow,opts.glow,opts.glow)}) : new THREE.MeshLambertMaterial({map:t});
  return H.plane(w,h,mat,x,y,z,ry,parent);
};
// animated canvas texture: draw(ctx, t, w, h) is called every `every` frames while the player is within `range` meters of (x,z)
H.screen = function(w,h,draw,opts){
  opts=opts||{}; var c=document.createElement('canvas'); c.width=w; c.height=h;
  var o={canvas:c, ctx:c.getContext('2d'), tex:new THREE.CanvasTexture(c), draw:draw, every:opts.every||2, n:0, x:opts.x, z:opts.z, range:opts.range||9};
  draw(o.ctx,0,w,h); screens.push(o); return o;
};
var screens = [];
H.figure = function(color,face,parent){
  var grp=new THREE.Group();
  var m=lam(color||0x1c1e26);
  var body=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.2,1.0,10),m); body.position.y=0.82; grp.add(body);
  var head=new THREE.Mesh(new THREE.SphereGeometry(0.13,12,10), lam(face||color||0x1c1e26)); head.position.y=1.5; grp.add(head);
  (parent||scene).add(grp); return grp;
};
var lightCount = 0;
H.plight = function(x,z,y,color,intensity,dist){ lightCount++; var L=new THREE.PointLight(color,intensity,dist||8,2); L.position.set(x*SC,y,z*SC); scene.add(L); return L; };
H.spot = function(x,z,y,tx,tz,ty,color,intensity,dist,angle,pen){ lightCount++;
  var L=new THREE.SpotLight(color,intensity,dist||7,angle||0.3,pen==null?0.45:pen,2); L.position.set(x*SC,y,z*SC);
  L.target.position.set(tx*SC,ty,tz*SC); scene.add(L); scene.add(L.target); return L; };
H.light = function(L){ lightCount++; scene.add(L); return L; };   // register any other light against the budget

// ---------- camera feeds: CCTV monitors and mirrors (render-to-texture) ----------
// Layer 5 is seen only by feeds: the player's stand-in, and ghosts that exist only on camera or in the glass.
// (XR eye cameras use layers 1 and 2, so feed-only content must not use those.)
var FEED=H.FEED_LAYER=5, feeds=[];
H.feedOnly = function(obj){ obj.traverse(function(o){ o.layers.set(FEED); }); return obj; };
// fixed camera: {x,z,y, tx,tz,ty, fov, w,h (px), every (frames), range (m from sx,sz or x,z)}
H.feed = function(o){ var w=o.w||320, h=o.h||240, rt=new THREE.WebGLRenderTarget(w,h);
  var cam=new THREE.PerspectiveCamera(o.fov||62,w/h,0.05,30); cam.layers.enable(FEED);
  cam.position.set(o.x*SC,o.y==null?2.35:o.y,o.z*SC); cam.lookAt(o.tx*SC,o.ty==null?1.2:o.ty,o.tz*SC);
  var f={rt:rt,cam:cam,tex:rt.texture,every:o.every||3,n:0,x:o.sx==null?o.x:o.sx,z:o.sz==null?o.z:o.sz,range:o.range||8,on:true};
  feeds.push(f); return f; };
// a monitor showing a feed: CRT-ish tint and scanlines
H.monitor = function(f,w,h,x,y,z,ry,o){ o=o||{};
  var mat=new THREE.ShaderMaterial({uniforms:{tex:{value:f.tex},t:{value:0},tint:{value:new THREE.Color(o.tint||0xcfe8d8)}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform sampler2D tex; uniform float t; uniform vec3 tint; varying vec2 vUv; void main(){ vec3 c=texture2D(tex,vUv).rgb; float g=dot(c,vec3(0.3,0.59,0.11));'+
      'float sl=0.82+0.18*sin(vUv.y*480.0+t*6.0); float n=fract(sin(dot(vUv*t,vec2(12.9898,78.233)))*43758.5453); gl_FragColor=vec4(tint*(g*1.35*sl+n*0.06),1.0); }'});
  var m=H.plane(w,h,mat,x,y,z,ry); f.screenMat=mat; return m; };
// mirror on a wall: {x,z,y,w,h,ry (facing, as H.plane), res, tint, range}
var tmpV=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()], rotM=new THREE.Matrix4(), plane4=new THREE.Plane(), clip4=new THREE.Vector4(), q4=new THREE.Vector4();
H.mirror = function(o){ var res=o.res||512, rt=new THREE.WebGLRenderTarget(res,res), tm=new THREE.Matrix4();
  var cam=new THREE.PerspectiveCamera(); cam.layers.enable(FEED);
  var mat=new THREE.ShaderMaterial({uniforms:{tex:{value:rt.texture},tm:{value:tm},tint:{value:new THREE.Color(o.tint||0xc9cfd6)}},
    vertexShader:'uniform mat4 tm; varying vec4 vP; void main(){ vP=tm*vec4(position,1.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform sampler2D tex; uniform vec3 tint; varying vec4 vP; void main(){ gl_FragColor=vec4(texture2DProj(tex,vP).rgb*tint,1.0); }'});
  var mesh=H.plane(o.w||0.8,o.h||1.2,mat,o.x,o.y==null?1.45:o.y,o.z,o.ry||0);
  var f={rt:rt,cam:cam,tex:rt.texture,every:o.every||1,n:0,x:o.x,z:o.z,range:o.range||7,on:true,mesh:mesh,mat:mat};
  f.update=function(view){   // Reflector-style virtual camera with an oblique near plane at the glass
    var mp=tmpV[0].setFromMatrixPosition(mesh.matrixWorld), cp=tmpV[1].setFromMatrixPosition(view.matrixWorld);
    rotM.extractRotation(mesh.matrixWorld); var n=tmpV[2].set(0,0,1).applyMatrix4(rotM);
    var v=tmpV[3].subVectors(mp,cp); if(v.dot(n)>0) return false;
    v.reflect(n).negate().add(mp);
    rotM.extractRotation(view.matrixWorld); var la=tmpV[4].set(0,0,-1).applyMatrix4(rotM).add(cp);
    var tg=tmpV[5].subVectors(mp,la).reflect(n).negate().add(mp);
    cam.position.copy(v); cam.up.set(0,1,0).applyMatrix4(rotM).reflect(n); cam.lookAt(tg);
    cam.far=view.far; cam.updateMatrixWorld(); cam.projectionMatrix.copy(view.projectionMatrix);
    tm.set(0.5,0,0,0.5, 0,0.5,0,0.5, 0,0,0.5,0.5, 0,0,0,1); tm.multiply(cam.projectionMatrix); tm.multiply(cam.matrixWorldInverse); tm.multiply(mesh.matrixWorld);
    plane4.setFromNormalAndCoplanarPoint(n,mp); plane4.applyMatrix4(cam.matrixWorldInverse);
    clip4.set(plane4.normal.x,plane4.normal.y,plane4.normal.z,plane4.constant);
    var pm=cam.projectionMatrix, e=pm.elements;
    q4.x=(Math.sign(clip4.x)+e[8])/e[0]; q4.y=(Math.sign(clip4.y)+e[9])/e[5]; q4.z=-1.0; q4.w=(1.0+e[10])/e[14];
    clip4.multiplyScalar(2.0/clip4.dot(q4)); e[2]=clip4.x; e[6]=clip4.y; e[10]=clip4.z+1.0; e[14]=clip4.w;
    return true; };
  feeds.push(f); return f; };
var avatar=null;   // the player as feeds and mirrors see them
function renderFeeds(){
  if(!feeds.length) return;
  var view=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera, xrE=renderer.xr.enabled, hv=hud.visible, did=false;
  for(var i=0;i<feeds.length;i++){ var f=feeds[i];
    if(!f.on || !H.near(f.x,f.z,f.range) || (f.n++)%f.every) continue;
    if(f.update && !f.update(view)) continue;
    if(!did){ did=true; renderer.xr.enabled=false; hud.visible=false;
      avatar.position.set(pos.x,0,pos.z); avatar.rotation.y=yaw; avatar.visible=true; }
    if(f.mesh) f.mesh.visible=false;
    renderer.setRenderTarget(f.rt); renderer.render(scene,f.cam);
    if(f.mesh) f.mesh.visible=true;
    if(f.screenMat) f.screenMat.uniforms.t.value=H.t||0;
  }
  if(did){ renderer.setRenderTarget(null); renderer.xr.enabled=xrE; hud.visible=hv; }
}

// ---------- world state ----------
var pos = H.pos = new THREE.Vector3(0,EYE,0);
var yaw=0, pitch=0, started=false, overview=false;
H.player = function(){ return {x:pos.x/SC, z:pos.z/SC, yaw:yaw}; };
H.near = function(x,z,r){ return Math.hypot(pos.x-x*SC,pos.z-z*SC) < r; };   // r in meters
H.inBox = function(x1,z1,x2,z2){ var px=pos.x/SC, pz=pos.z/SC; return px>Math.min(x1,x2)&&px<Math.max(x1,x2)&&pz>Math.min(z1,z2)&&pz<Math.max(z1,z2); };
H.startAt = function(x,z,y){ pos.set(x*SC,EYE,z*SC); yaw=y||0; };
H.teleport = function(x,z,y){ pos.x=x*SC; pos.z=z*SC; if(y!==undefined) yaw=y; xr.init=false; };   // in VR the rig re-anchors next frame
var updaters=[], beginFns=[], skipFns=[];
H.onUpdate = function(fn){ updaters.push(fn); };
H.onBegin = function(fn){ beginFns.push(fn); };
H.onSkip = function(fn){ skipFns.push(fn); };
H.skip = function(){ skipFns.forEach(function(f){ f(); }); };
// trigger zones: {x1,z1,x2,z2, enter(), exit(), during(dt,t), once, when()} (checked only after the player starts)
var zones=[];
H.zone = function(z){ z.inside=false; z.fired=false; zones.push(z); return z; };
// stations shown on the HUD when within 3.4 m
var stations = H.stations = [];
H.station = function(s){ stations.push(s);
  var c=document.createElement('canvas'); c.width=128;c.height=128; var g=c.getContext('2d');
  g.fillStyle='#f6a13c'; g.strokeStyle='#8a5a12'; g.lineWidth=6;
  if (g.roundRect){ g.beginPath(); g.roundRect(14,14,100,100,20); g.fill(); g.stroke(); } else { g.fillRect(14,14,100,100); g.strokeRect(14,14,100,100); }
  g.fillStyle='#3a2a10'; g.font='bold 62px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(s.n),64,68);
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,fog:false}));
  sp.scale.set(0.34,0.34,1); sp.position.set(s.x*SC,2.42,s.z*SC); scene.add(sp); badges.push(sp); return s; };
var badges=[];
// route arrows along a polyline of [x,z] points
var arrows = new THREE.Group(); scene.add(arrows);
H.route = function(path){
  H.PATH = path;
  var tex=(function(){ var c=document.createElement('canvas'); c.width=128;c.height=128; var g=c.getContext('2d');
    g.strokeStyle='#3fd47f'; g.lineWidth=16; g.lineCap='round'; g.beginPath();
    g.moveTo(22,64); g.lineTo(96,64); g.moveTo(70,36); g.lineTo(100,64); g.lineTo(70,92); g.stroke();
    return new THREE.CanvasTexture(c); })();
  var mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0.4,depthWrite:false});
  for(var i=0;i<path.length-1;i++){
    var a=path[i],b=path[i+1], L=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(L*SC/1.6));
    for(var k=0;k<n;k++){ var f=(k+0.5)/n;
      var g=new THREE.PlaneGeometry(0.5,0.5); g.rotateX(-Math.PI/2);
      var m=new THREE.Mesh(g,mat); m.position.set((a[0]+(b[0]-a[0])*f)*SC,0.02,(a[1]+(b[1]-a[1])*f)*SC);
      m.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]); arrows.add(m); }
  }
};

// ---------- audio (Web Audio; spatial when given {x,z}) ----------
var AC=null, master=null;
function audio(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)();
  var comp=AC.createDynamicsCompressor(); master=AC.createGain(); master.gain.value=0.9; master.connect(comp); comp.connect(AC.destination); }catch(e){} }
  if(AC && AC.state==='suspended'){ try{ AC.resume(); }catch(e){} } return AC; }
H.audio = audio;
function out(o){ var ac=audio(); if(!ac) return null; o=o||{};
  var g=ac.createGain(); g.gain.value=o.gain==null?1:o.gain;
  if(o.x!=null){ var p=ac.createPanner(); p.panningModel='HRTF'; p.distanceModel='inverse'; p.refDistance=o.ref||1.2; p.maxDistance=40; p.rolloffFactor=o.rolloff||1.3;
    var px=o.x*SC, py=o.y==null?1.5:o.y, pz=o.z*SC;
    if(p.positionX){ p.positionX.value=px; p.positionY.value=py; p.positionZ.value=pz; } else p.setPosition(px,py,pz);
    g.connect(p); p.connect(master); } else g.connect(master);
  return g; }
function noiseBuf(dur){ var ac=audio(), len=Math.floor(ac.sampleRate*dur), buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
  for(var i=0;i<len;i++) d[i]=Math.random()*2-1; return buf; }
var sfx = H.sfx = {};
// filtered noise burst with a squared decay; o: {type:'lowpass'|'bandpass'|'highpass', q, x, z, gain}
sfx.noise = function(dur,freq,gain,o){ var ac=audio(); if(!ac) return; o=o||{}; try{
  var len=Math.floor(ac.sampleRate*dur), buf=ac.createBuffer(1,len,ac.sampleRate), d=buf.getChannelData(0);
  for(var i=0;i<len;i++){ d[i]=(Math.random()*2-1)*Math.pow(1-i/len,o.decay==null?2:o.decay); }
  var src=ac.createBufferSource(); src.buffer=buf; var f=ac.createBiquadFilter(); f.type=o.type||'lowpass'; f.frequency.value=freq; if(o.q) f.Q.value=o.q;
  var g=out({gain:gain,x:o.x,z:o.z,y:o.y}); src.connect(f); f.connect(g); src.start(ac.currentTime+(o.delay||0)); }catch(e){} };
// oscillator note; o: {type, delay, attack, x, z, glide}
sfx.tone = function(freq,dur,gain,o){ var ac=audio(); if(!ac) return; o=o||{}; try{
  var t0=ac.currentTime+(o.delay||0), osc=ac.createOscillator(), g=ac.createGain(); osc.type=o.type||'sine'; osc.frequency.setValueAtTime(freq,t0);
  if(o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide,t0+dur);
  g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(gain,t0+(o.attack||0.01)); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  osc.connect(g); g.connect(out({x:o.x,z:o.z,y:o.y})); osc.start(t0); osc.stop(t0+dur+0.05); }catch(e){} };
sfx.thunder = function(){ sfx.noise(2.4,110,0.9); sfx.noise(1.6,80,0.6,{delay:0.35}); };
sfx.bang = function(o){ sfx.noise(0.18,500,0.8,o); };
sfx.ding = function(o){ [880,660].forEach(function(f,i){ sfx.tone(f,0.5,0.12,{delay:i*0.18,x:o&&o.x,z:o&&o.z}); }); };
sfx.bell = function(o){ o=o||{}; [2350,4700,3520].forEach(function(f,i){ sfx.tone(f,1.4-i*0.3,0.07/(i+1),{x:o.x,z:o.z}); }); };   // front-desk service bell
sfx.sting = function(o){ [92,138,196].forEach(function(f){ sfx.tone(f,0.7,0.09,{type:'sawtooth',x:o&&o.x,z:o&&o.z}); }); sfx.noise(0.5,900,0.5,o); };
sfx.whisper = function(o){ o=o||{}; for(var i=0;i<5;i++) sfx.noise(0.35+Math.random()*0.4,2600+Math.random()*1800,0.16,{type:'bandpass',q:3,delay:i*0.28,decay:0.6,x:o.x,z:o.z}); };
sfx.ring = function(o){ o=o||{}; for(var i=0;i<2;i++){ [440,480].forEach(function(f){ for(var k=0;k<20;k++) sfx.tone(f,0.05,0.05,{delay:i*3+k*0.1,x:o.x,z:o.z,type:'square'}); }); } };   // two-bell telephone
sfx.typewriter = function(n,o){ o=o||{}; for(var i=0;i<(n||12);i++) sfx.noise(0.04,3200,0.35,{type:'bandpass',q:2,delay:i*(0.09+Math.random()*0.08),x:o.x,z:o.z}); };
sfx.heartbeat = function(n,o){ o=o||{}; for(var i=0;i<(n||4);i++){ sfx.tone(55,0.18,0.5,{delay:i*0.85,x:o.x,z:o.z}); sfx.tone(50,0.16,0.35,{delay:i*0.85+0.22,x:o.x,z:o.z}); } };
// looping bed: {kind:'drone'|'noise'|'hum', freq, gain, x, z, type} → {stop(), set(gain)}
sfx.loop = function(o){ var ac=audio(); if(!ac) return {stop:function(){},set:function(){}}; o=o||{};
  var g=out({gain:0.0001,x:o.x,z:o.z,y:o.y,ref:o.ref,rolloff:o.rolloff}), src;
  try{
    if(o.kind==='noise'){ src=ac.createBufferSource(); src.buffer=noiseBuf(2); src.loop=true; var f=ac.createBiquadFilter(); f.type=o.type||'lowpass'; f.frequency.value=o.freq||400; src.connect(f); f.connect(g); }
    else { src=ac.createOscillator(); src.type=o.type||(o.kind==='hum'?'sawtooth':'sine'); src.frequency.value=o.freq||60;
      if(o.kind==='hum'){ var lp=ac.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=240; src.connect(lp); lp.connect(g); } else src.connect(g); }
    src.start(); g.gain.exponentialRampToValueAtTime(o.gain||0.05,ac.currentTime+1.5);
  }catch(e){}
  return {stop:function(){ try{ g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+0.8); src.stop(ac.currentTime+0.9); }catch(e){} },
          set:function(v){ try{ g.gain.setTargetAtTime(Math.max(0.0001,v),ac.currentTime,0.3); }catch(e){} }};
};
var loopsOnBegin=[];
H.ambience = function(o){ var h={}; loopsOnBegin.push(function(){ var l=sfx.loop(o); h.stop=l.stop; h.set=l.set; }); return h; };   // starts after the first click

// ---------- captions + narrator (Dean Alice Lloyd) ----------
var capEl=document.getElementById('caption'), stageEl=document.getElementById('stage'), scareEl=document.getElementById('scare');
var hudState={who:'',line:'',stage:'',scare:''};
H.cap = function(txt){ hudState.stage=txt||''; stageEl.textContent=hudState.stage; };   // stage directions: italic, no speaker
var narr={q:[],cur:null,left:0,voice:true,v:null};
function pickVoice(){ if(!window.speechSynthesis) return null; var vs=speechSynthesis.getVoices(); if(!vs.length) return null;
  var pref=/(Samantha|Moira|Serena|Karen|Tessa|Libby|Sonia|Hazel|Zira|Google UK English Female|Female)/i;
  return vs.filter(function(v){ return /^en/i.test(v.lang) && pref.test(v.name); })[0] || vs.filter(function(v){ return /^en/i.test(v.lang); })[0] || null; }
if(window.speechSynthesis){ speechSynthesis.onvoiceschanged=function(){ narr.v=pickVoice(); }; narr.v=pickVoice(); }
function speak(text){ if(!narr.voice || !window.speechSynthesis) return; try{ speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text); if(narr.v) u.voice=narr.v; u.rate=0.9; u.pitch=0.82; u.volume=0.95; speechSynthesis.speak(u); }catch(e){} }
function showLine(){ var c=narr.cur; hudState.who=c?c.who:''; hudState.line=c?c.text:'';
  capEl.innerHTML=c?((c.who?'<span class="who">'+c.who+'</span>':'')+'<span class="line"></span>'):''; if(c) capEl.querySelector('.line').textContent=c.text; }
// H.say(lines, {who:'DEAN LLOYD', voice:true, interrupt:false, hold:seconds})
H.say = function(lines,o){ o=o||{}; if(typeof lines==='string') lines=[lines];
  if(o.interrupt){ narr.q.length=0; narr.cur=null; if(window.speechSynthesis) try{ speechSynthesis.cancel(); }catch(e){} }
  var who=o.who===undefined?'DEAN LLOYD':o.who;
  lines.forEach(function(l){ narr.q.push({text:l,who:who,voice:o.voice===undefined?(who==='DEAN LLOYD'):o.voice,hold:o.hold,at:o.at}); }); };
// one-shot narration when the player first enters a box: {id, x1,z1,x2,z2, lines, when(), interrupt}
H.narrate = function(n){ return H.zone({x1:n.x1,z1:n.z1,x2:n.x2,z2:n.z2,once:n.once!==false,when:n.when,enter:function(){ H.say(n.lines,{interrupt:n.interrupt,who:n.who,at:n.at}); if(n.then) n.then(); }}); };
// brass speaker grilles the Dean speaks through: they glow while her line plays (H.say(lines,{at:id}))
var grilles={};
H.grille = function(id,x,y,z,ry){ var m=H.plane(0.22,0.14,H.glow(0xb8873b,0.05),x,y,z,ry); grilles[id]={mesh:m,x:x,z:z,y:y}; return m; };
H.voice = function(on){ narr.voice=on===undefined?!narr.voice:on; if(!narr.voice && window.speechSynthesis) try{ speechSynthesis.cancel(); }catch(e){} return narr.voice; };
function narrTick(dt){
  if(!narr.cur && narr.q.length){ narr.cur=narr.q.shift(); narr.left=narr.cur.hold||(1.6+narr.cur.text.length*0.066); narr.max=narr.left*2.6; if(narr.cur.voice) speak(narr.cur.text); showLine();
    var gr=narr.cur.at&&grilles[narr.cur.at]; if(gr) sfx.noise(0.25,2400,0.12,{type:'bandpass',q:1.5,x:gr.x,z:gr.z,y:gr.y,decay:0.5}); }
  else if(narr.cur){ narr.left-=dt; narr.max-=dt;
    var g2=narr.cur.at&&grilles[narr.cur.at]; if(g2) g2.mesh.material.emissiveIntensity=0.12+0.48*Math.abs(Math.sin(H.t*8.5+Math.sin(H.t*3.1)));
    var talking=narr.cur.voice && narr.voice && window.speechSynthesis && speechSynthesis.speaking;
    if((narr.left<=0 && !talking) || narr.max<=0){ if(g2) g2.mesh.material.emissiveIntensity=0.05; narr.cur=null; if(!narr.q.length) showLine(); } }
}
var scareT=0;
H.scare = function(txt,secs){ hudState.scare=txt; scareEl.textContent=txt; scareEl.style.display='block'; scareT=secs||1.6; };

// ---------- show helpers ----------
H.flick = function(t,hz,duty){ var p=(t*Math.min(hz||2,3))%1; return p<(duty||0.5)?1:0.15; };   // flicker, capped at 3 Hz for photosensitivity
var _hv=new THREE.Vector3(), _fv=new THREE.Vector3(), _dv=new THREE.Vector3();
H.headPos = function(){ return camera.getWorldPosition(_hv); };
// is the player looking at (x,y,z) from within maxM meters? cos = how tight (0.95 ~ 18 degrees)
H.gaze = function(x,y,z,maxM,cos){ var h=H.headPos(); _dv.set(x*SC-h.x,y-h.y,z*SC-h.z); var L=_dv.length(); if(L>(maxM||3)) return false;
  camera.getWorldDirection(_fv); return _fv.dot(_dv.divideScalar(L||1))>(cos||0.95); };
// the "use" action (Enter, VR trigger or A) while standing in a box
H.onUse = H.onSkip;
H.useIn = function(x1,z1,x2,z2,fn){ H.onSkip(function(){ if(H.inBox(x1,z1,x2,z2)) fn(); }); };
// cue timeline: H.show([[0,fn],[1.5,fn]...]) -> {go(), running(), stop()}
H.show = function(cues){ var st={t:-1,i:0}; st.go=function(){ st.t=0; st.i=0; }; st.running=function(){ return st.t>=0; }; st.stop=function(){ st.t=-1; };
  H.onUpdate(function(dt){ if(st.t<0) return; st.t+=dt; while(st.i<cues.length && cues[st.i][0]<=st.t){ cues[st.i][1](); st.i++; } if(st.i>=cues.length) st.t=-1; }); return st; };
// additive, unlit, starts invisible: holograms, Pepper's-ghost figures, projections (animate .opacity)
H.holoMat = function(tex,color){ return new THREE.MeshBasicMaterial({map:tex||null,color:color||0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}); };
// bake static meshes that share one material into a single draw call (r128 core has no BufferGeometryUtils)
H.merge = function(meshes,mat){ if(!meshes.length) return null; var pos=[],nor=[],uv=[];
  meshes.forEach(function(m){ m.updateMatrixWorld(true); var g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(); g.applyMatrix4(m.matrixWorld);
    pos.push(g.attributes.position.array); nor.push(g.attributes.normal.array); uv.push(g.attributes.uv?g.attributes.uv.array:new Float32Array(g.attributes.position.count*2));
    if(m.parent) m.parent.remove(m); });
  function cat(arrs){ var n=0; arrs.forEach(function(a){ n+=a.length; }); var o=new Float32Array(n), k=0; arrs.forEach(function(a){ o.set(a,k); k+=a.length; }); return o; }
  var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(cat(pos),3)); geo.setAttribute('normal',new THREE.BufferAttribute(cat(nor),3)); geo.setAttribute('uv',new THREE.BufferAttribute(cat(uv),2));
  var mm=new THREE.Mesh(geo,mat||meshes[0].material); scene.add(mm); return mm; };
H.party = (function(){ try{ return (new URLSearchParams(location.search).get('party')||'').slice(0,24).toUpperCase(); }catch(e){ return ''; } })();   // ?party=Smith personalizes signage
H.stay = {suites:{}};   // shared show state (which suites the party has opened, etc.)

// hotel suite door in a wall opening (x1,z1)-(x2,z2) with a keycard reader.
// o: {approach:+1|-1 (+1: guests stand on the right-hand side of x1->x2 as drawn on the north-up plan; a door drawn west->east with approach +1 is entered from the south), plate:[lines], num, ready(), onOpen(), autoClose:true}
// Opens on USE within 1.2 m while looking at it, after 1.5 s of looking, or after 4 s standing at it (so nobody gets stuck).
H.suiteDoor = function(o){
  var dx=o.x2-o.x1, dz=o.z2-o.z1, Ls=Math.hypot(dx,dz), L=Ls*SC, ux=dx/Ls, uz=dz/Ls, nx=-uz, nz=ux, sgn=o.approach||1, th=-Math.atan2(dz,dx);
  var leafMat=o.mat||H.mat.door, two=L>1.1, hinges=[];
  function hinge(x,z,base,w,flip){ var g=H.group(x,z,base); var leaf=new THREE.Mesh(new THREE.BoxGeometry(w,2.13,0.05),leafMat); leaf.position.set(w/2,1.065,0); g.add(leaf);
    var lv=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.025,0.05),H.mat.brass); lv.position.set(w-0.1,1.0,0.05*sgn*flip); g.add(lv); hinges.push({g:g,base:base,flip:flip}); }
  if(two){ hinge(o.x1,o.z1,th,L/2,1); hinge(o.x2,o.z2,th+Math.PI,L/2,-1); } else hinge(o.x1,o.z1,th,L,1);
  var mx=(o.x1+o.x2)/2, mz=(o.z1+o.z2)/2, fo=0.09/SC*sgn;
  H.box(L+0.12,0.08,0.22,H.mat.woodDark,mx,2.17,mz,th);
  [[o.x1,o.z1],[o.x2,o.z2]].forEach(function(p){ H.box(0.06,2.13,0.22,H.mat.woodDark,p[0],1.065,p[1],th); });
  var pm=new THREE.MeshLambertMaterial({map:H.textTexture(o.plate||[''],{w:384,h:128,fs:46,bg:'#1d1a16',fg:'#d9b76a',border:'#8a6a2a',bw:8})});
  var plx=o.x2+ux*(0.28/SC)+nx*fo, plz=o.z2+uz*(0.28/SC)+nz*fo, faceRy=Math.atan2(nx*sgn,nz*sgn);
  H.plane(0.3,0.1,pm,plx,1.52,plz,faceRy);
  var rx=o.x2+ux*(0.2/SC)+nx*fo, rz=o.z2+uz*(0.2/SC)+nz*fo;
  H.box(0.07,0.11,0.03,H.mat.brass,rx,1.12,rz,th);
  var ringMat=new THREE.MeshBasicMaterial({color:0xf2efe6,fog:false}), ring=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.007,8,24),ringMat);
  ring.position.set(rx*SC+nx*sgn*0.02,1.12,rz*SC+nz*sgn*0.02); ring.rotation.y=faceRy; scene.add(ring);
  var gate=H.gate(o.x1,o.z1,o.x2,o.z2); map.doors.push([o.x1,o.z1,o.x2,o.z2]);
  var ax=mx+nx*sgn*(1.0/SC), az=mz+nz*sgn*(1.0/SC), d={open:0,target:0,isOpen:false,gazeT:0,dwellT:0,warned:false,awayT:0,gate:gate,ring:ringMat,plate:pm};
  d.setRing=function(c){ ringMat.color.setHex(c); };
  d.openDoor=function(){ if(d.isOpen) return; if(o.ready && !o.ready()){ d.setRing(0xffb030); if(!d.warned){ d.warned=true; H.cap('The reader glows amber: MAKING UP ROOM.'); setTimeout(function(){ H.cap(''); },2200); } return; }
    d.isOpen=true; d.target=1; gate.off=true; d.setRing(0x3fd47f); sfx.noise(0.12,300,0.7,{x:mx,z:mz}); sfx.tone(90,0.15,0.3,{x:mx,z:mz}); if(o.num) H.stay.suites[o.num]=true; if(o.onOpen) o.onOpen(); };
  d.close=function(){ d.isOpen=false; d.target=0; gate.off=false; d.setRing(0xf2efe6); d.warned=false; d.gazeT=0; d.dwellT=0; };
  H.onSkip(function(){ if(!d.isOpen && H.near(mx,mz,1.2) && H.gaze(mx,1.2,mz,1.6,0.8)) d.openDoor(); });
  H.onUpdate(function(dt){
    if(!d.isOpen){ var near=H.near(ax,az,1.0);
      d.gazeT=H.gaze(rx,1.12,rz,1.6,0.9)?d.gazeT+dt:0; d.dwellT=near?d.dwellT+dt:0;
      if(d.gazeT>1.5 || d.dwellT>4) d.openDoor();
      if(!near && !H.near(mx,mz,2) && ringMat.color.getHex()===0xffb030){ d.setRing(0xf2efe6); d.warned=false; } }
    else if(o.autoClose!==false){ d.awayT=H.near(mx,mz,12)?0:d.awayT+dt; if(d.awayT>20) d.close(); }
    if(d.open!==d.target){ d.open+= (d.target>d.open?1:-1)*dt/1.2; d.open=Math.max(0,Math.min(1,d.open));
      hinges.forEach(function(h){ h.g.rotation.y=h.base+h.flip*sgn*d.open*Math.PI*0.5; }); }
  });
  return d;
};

// ---------- controls ----------
var keys={}, dragging=false, lastX=0,lastY=0, locked=false, showHelp=true, ovSave={};
function onLook(dx,dy){ yaw-=dx*0.0023; pitch-=dy*0.0021; pitch=Math.max(-1.25,Math.min(1.25,pitch)); }
canvas.addEventListener('mousedown',function(e){ dragging=true; lastX=e.clientX; lastY=e.clientY; });
window.addEventListener('mouseup',function(){ dragging=false; });
window.addEventListener('mousemove',function(e){
  if(locked){ onLook(e.movementX||0,e.movementY||0); }
  else if(dragging){ onLook(e.clientX-lastX,e.clientY-lastY); lastX=e.clientX; lastY=e.clientY; }
});
document.addEventListener('pointerlockchange',function(){ locked=(document.pointerLockElement===canvas); });
window.addEventListener('keydown',function(e){
  keys[e.code]=true;
  if(e.code==='Tab'){ e.preventDefault(); toggleOverview(); }
  if(e.code==='KeyG'){ arrows.visible=!arrows.visible; }
  if(e.code==='KeyH'){ showHelp=!showHelp; document.getElementById('help').style.display=showHelp?'block':'none'; }
  if(e.code==='KeyL'){ H.cap(H.houseLights()?'House lights on: the room as it really is':'Show mode'); setTimeout(function(){ H.cap(''); },1800); }
  if(e.code==='KeyV'){ H.cap(H.voice()?'Dean Lloyd’s voice on':'Dean Lloyd’s voice off (captions stay)'); setTimeout(function(){ H.cap(''); },1600); }
  if(e.code==='Enter' && started){ H.skip(); }
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].indexOf(e.code)>=0) e.preventDefault();
});
window.addEventListener('keyup',function(e){ keys[e.code]=false; });
// bird's-eye: orthographic, north up; ceiling-level meshes hide so the plan reads
var ovCamO=new THREE.OrthographicCamera(-1,1,1,-1,0.1,80); ovCamO.up.set(0,0,-1);
var ovHidden=[], ovArrowsWas=true, wp=new THREE.Vector3();
var marker=(function(){ var sh=new THREE.Shape(); sh.moveTo(0,0.45); sh.lineTo(-0.3,-0.3); sh.lineTo(0,-0.12); sh.lineTo(0.3,-0.3); sh.lineTo(0,0.45);
  var m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0x3fd47f,fog:false})); m.rotation.order='YXZ'; m.rotation.x=-Math.PI/2; m.position.y=2.9; m.userData.cap=true; caps.add(m); return m; })();
function toggleOverview(){
  if(renderer.xr.isPresenting) return;
  overview=!overview;
  if(overview){ ovSave={p:pos.clone(),y:yaw,pt:pitch}; ovArrowsWas=arrows.visible; arrows.visible=true;
    ovHidden=[]; scene.traverse(function(o){ if(o.isMesh && o.visible && !o.userData.cap){ o.getWorldPosition(wp); if(wp.y>2.3){ ovHidden.push(o); o.visible=false; } } }); }
  else { pos.copy(ovSave.p); yaw=ovSave.y; pitch=ovSave.pt; arrows.visible=ovArrowsWas; ovHidden.forEach(function(o){ o.visible=true; }); }
  caps.visible=overview;
  scene.fog.density=overview?0.004:(house.on?0.018:H.fogDensity); ovLight.intensity=overview?0.85:0;
  badges.forEach(function(b){ b.scale.setScalar(overview?0.9:0.34); });
}

function collide(){
  for(var pass=0;pass<2;pass++){
    for(var i=0;i<solids.length;i++){
      var s=solids[i]; if(s.off) continue;
      var ax=s.x1,az=s.z1,bx=s.x2,bz=s.z2, dx=bx-ax,dz=bz-az;
      var L2=dx*dx+dz*dz||1e-6;
      var t=((pos.x-ax)*dx+(pos.z-az)*dz)/L2; t=Math.max(0,Math.min(1,t));
      var cx=ax+dx*t, cz=az+dz*t, ox=pos.x-cx, oz=pos.z-cz, d=Math.sqrt(ox*ox+oz*oz);
      if(d<PR && d>1e-5){ var push=(PR-d)/d; pos.x+=ox*push; pos.z+=oz*push; }
    }
  }
  pos.x=Math.max(B.x1*SC,Math.min(B.x2*SC,pos.x)); pos.z=Math.max(B.z1*SC,Math.min(B.z2*SC,pos.z));
}
var B={x1:-1e4,z1:-1e4,x2:1e4,z2:1e4};   // plan bounds, computed in run()

// ---------- minimap ----------
var mm=document.getElementById('minimap'), mg=mm.getContext('2d'), mmBase=document.createElement('canvas'), MMX, MMZ;
function buildMinimap(){
  mmBase.width=mm.width; mmBase.height=mm.height;
  var s=Math.min((mm.width-12)/(B.x2-B.x1),(mm.height-12)/(B.z2-B.z1)), ox=(mm.width-(B.x2-B.x1)*s)/2, oz=(mm.height-(B.z2-B.z1)*s)/2;
  MMX=function(x){ return (x-B.x1)*s+ox; }; MMZ=function(z){ return (z-B.z1)*s+oz; };
  var g=mmBase.getContext('2d'); g.clearRect(0,0,mmBase.width,mmBase.height); g.lineCap='round';
  function line(w,style,lw){ g.strokeStyle=style; g.lineWidth=lw; g.beginPath(); g.moveTo(MMX(w[0]),MMZ(w[1])); g.lineTo(MMX(w[2]),MMZ(w[3])); g.stroke(); }
  map.walls.forEach(function(w){ line(w,'#8f8674',1.5); });
  map.curtains.forEach(function(w){ line(w,w[4],2.2); });
  map.doors.forEach(function(w){ line(w,'#f6a13c',2.5); });
  stations.forEach(function(st){ g.fillStyle='#f6a13c'; g.font='bold 9px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(st.n),MMX(st.x),MMZ(st.z)); });
}

// ---------- WebXR (Meta Quest) ----------
// left stick walk (click: house lights) · right stick snap-turn · trigger/A skip intro · B route arrows · Y narrator voice · X wrist map
var xr={init:false,turnArmed:true,prev:{},fw:new THREE.Vector3(),maps:0};
var hudC=document.createElement('canvas'); hudC.width=1024; hudC.height=420;
var hudTex=new THREE.CanvasTexture(hudC), hudKey=null;
var hud=new THREE.Mesh(new THREE.PlaneGeometry(0.96,0.394), new THREE.MeshBasicMaterial({map:hudTex,transparent:true,depthTest:false,depthWrite:false,fog:false}));
hud.position.set(0,-0.28,-1.25); hud.renderOrder=999; hud.visible=false; camera.add(hud);
function wrapLines(g,txt,maxW,max){ var words=txt.split(' '), lines=[''];
  words.forEach(function(w){ var t=lines[lines.length-1]?lines[lines.length-1]+' '+w:w; if(g.measureText(t).width>maxW && lines[lines.length-1]) lines.push(w); else lines[lines.length-1]=t; });
  return lines.slice(0,max); }
function drawHud(st){
  var g=hudC.getContext('2d'); g.clearRect(0,0,hudC.width,hudC.height); g.textAlign='center'; g.textBaseline='middle';
  function slab(y,h){ g.fillStyle='rgba(8,8,12,0.74)'; g.fillRect(36,y,952,h); }
  var y=8;
  if(hudState.stage){ g.font='italic 30px Georgia,serif'; var sl=wrapLines(g,hudState.stage,900,1); slab(y,50); g.fillStyle='#c9c2b2'; g.fillText(sl[0],512,y+26); y+=58; }
  if(hudState.line){ g.font='italic 36px Georgia,serif'; var lines=wrapLines(g,hudState.line,900,3), h=(hudState.who?40:0)+lines.length*44+18; slab(y,h);
    if(hudState.who){ g.fillStyle='#f6a13c'; g.font='bold 26px Avenir Next,Segoe UI,sans-serif'; g.fillText(hudState.who,512,y+24); }
    g.fillStyle='#ffdf9e'; g.font='italic 36px Georgia,serif'; lines.forEach(function(l,i){ g.fillText(l,512,y+(hudState.who?40:0)+30+i*44); }); y+=h+8; }
  if(hudState.scare){ g.fillStyle='#ff4b3a'; g.font='bold 60px Georgia,serif'; g.fillText(hudState.scare,512,Math.max(y+40,200)); }
  if(st){ slab(314,100); g.fillStyle='#f6a13c'; g.font='bold 42px Georgia,serif'; g.fillText(st.n+'  ·  '+st.name,512,346); g.fillStyle='#e8e2d4'; g.font='28px Avenir Next,Segoe UI,sans-serif'; g.fillText(wrapLines(g,st.desc,920,1)[0],512,392); }
  hudTex.needsUpdate=true;
}
var wristTex=new THREE.CanvasTexture(mm);
var wrist=new THREE.Group();
(function(){ var back=new THREE.Mesh(new THREE.PlaneGeometry(0.18,0.17), new THREE.MeshBasicMaterial({color:0x0c0b09,fog:false})); wrist.add(back);
  var face=new THREE.Mesh(new THREE.PlaneGeometry(0.17,0.16), new THREE.MeshBasicMaterial({map:wristTex,transparent:true,fog:false})); face.position.z=0.002; wrist.add(face); })();
wrist.position.set(0,0.035,0.1); wrist.rotation.x=-Math.PI/2+0.6;
(function(){
  var ctrlMat=lam(0x26262c,{emissive:0x101016});
  var rayGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-0.3)]);
  for(var ci=0;ci<2;ci++){
    var grip=renderer.xr.getControllerGrip(ci);
    var body=new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.024,0.11,10),ctrlMat); body.rotation.x=Math.PI/2; grip.add(body);
    grip.addEventListener('connected',function(e){ if(e.data&&e.data.handedness==='left') this.add(wrist); });
    grip.addEventListener('disconnected',function(){ if(wrist.parent===this) this.remove(wrist); });
    rig.add(grip);
    var ray=renderer.xr.getController(ci);
    ray.add(new THREE.Line(rayGeo,new THREE.LineBasicMaterial({color:0x3fd47f,transparent:true,opacity:0.55})));
    rig.add(ray);
  }
})();
function xrPad(){
  var s=renderer.xr.getSession(), o={mx:0,my:0,turn:0,skip:false,arrows:false,map:false,voice:false};
  if(!s) return o;
  for(var i=0;i<s.inputSources.length;i++){
    var src=s.inputSources[i], gp=src.gamepad; if(!gp) continue;
    var ax=gp.axes.length>=4?gp.axes[2]:(gp.axes[0]||0), ay=gp.axes.length>=4?gp.axes[3]:(gp.axes[1]||0);
    var b=function(k){ return !!(gp.buttons[k]&&gp.buttons[k].pressed); };
    if(src.handedness==='left'){ o.mx=ax; o.my=ay; o.map=b(4); o.voice=b(5); o.house=b(3); }
    else { o.turn=ax; o.skip=b(0)||b(4); o.arrows=b(5); }
  }
  return o;
}
function xrStep(dt){
  renderer.xr.getCamera(camera);                       // refresh head pose (rig-local) for this frame
  var hl=camera.position, a=rig.rotation.y, c=Math.cos(a), s=Math.sin(a);
  if(!xr.init){                                        // face the same way the desktop view was facing
    xr.fw.set(0,0,-1).applyQuaternion(camera.quaternion);
    rig.rotation.y=a=(yaw+Math.PI)-Math.atan2(-xr.fw.x,-xr.fw.z); c=Math.cos(a); s=Math.sin(a);
    rig.position.y=Math.max(0,1.55-hl.y);              // lift seated players to standing eye height
    xr.init=true;
  } else { pos.x=rig.position.x+hl.x*c+hl.z*s; pos.z=rig.position.z-hl.x*s+hl.z*c; }
  var p=xrPad(), dz=0.18;
  xr.fw.set(0,0,-1).applyQuaternion(camera.quaternion);
  var fx=xr.fw.x*c+xr.fw.z*s, fz=-xr.fw.x*s+xr.fw.z*c, fl=Math.hypot(fx,fz)||1; fx/=fl; fz/=fl;
  var mf=Math.abs(p.my)>dz?-p.my:0, ms=Math.abs(p.mx)>dz?p.mx:0, sp=2.0;
  pos.x+=(fx*mf - fz*ms)*sp*dt; pos.z+=(fz*mf + fx*ms)*sp*dt;
  collide();
  if(xr.turnArmed && Math.abs(p.turn)>0.7){ rig.rotation.y=a=a-Math.sign(p.turn)*Math.PI/6; c=Math.cos(a); s=Math.sin(a); xr.turnArmed=false; }
  else if(Math.abs(p.turn)<0.35) xr.turnArmed=true;
  rig.position.x=pos.x-(hl.x*c+hl.z*s); rig.position.z=pos.z-(-hl.x*s+hl.z*c);
  yaw=Math.atan2(fx,fz);
  if(p.skip && !xr.prev.skip && started) H.skip();
  if(p.arrows && !xr.prev.arrows) arrows.visible=!arrows.visible;
  if(p.map && !xr.prev.map) wrist.visible=!wrist.visible;
  if(p.house && !xr.prev.house){ H.cap(H.houseLights()?'House lights on':'Show mode'); setTimeout(function(){ H.cap(''); },1600); }
  if(p.voice && !xr.prev.voice){ H.cap(H.voice()?'Dean Lloyd’s voice on':'Dean Lloyd’s voice off'); setTimeout(function(){ H.cap(''); },1600); }
  xr.prev=p;
}
function enterVR(){
  if(!navigator.xr || renderer.xr.isPresenting) return;
  navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']}).then(function(session){
    return renderer.xr.setSession(session);
  }).catch(function(err){ H.cap('Could not start VR: '+(err&&err.message||err)); });
}
H.enterVR = enterVR;
renderer.xr.addEventListener('sessionstart',function(){
  xr.init=false; hudKey=null; hud.visible=true;
  var bl=renderer.xr.getSession().renderState.baseLayer; if(bl && 'fixedFoveation' in bl) bl.fixedFoveation=1;
  document.getElementById('vrbtn').style.display='none';
});
renderer.xr.addEventListener('sessionend',function(){
  hud.visible=false; rig.position.set(0,0,0); rig.rotation.set(0,0,0); pitch=0;
  document.getElementById('vrbtn').style.display=started?'block':'none';
});

// ---------- start ----------
function begin(){
  if(started) return;
  started=true; document.getElementById('overlay').style.display='none'; audio();
  if(xr.supported) document.getElementById('vrbtn').style.display='block';
  loopsOnBegin.forEach(function(f){ f(); });
  beginFns.forEach(function(f){ f(); });
}
H.begin = begin;
H.started = function(){ return started; };

function resize(){ if(renderer.xr.isPresenting) return; var w=window.innerWidth,h=window.innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  var hw=(B.x2-B.x1)*SC/2*1.05+0.4, hh=(B.z2-B.z1)*SC/2*1.05+0.4, a=w/h; if(hw/hh<a) hw=hh*a; else hh=hw/a;
  ovCamO.left=-hw; ovCamO.right=hw; ovCamO.top=hh; ovCamO.bottom=-hh; ovCamO.updateProjectionMatrix(); }

// ---------- main loop ----------
var clock=new THREE.Clock(), stEl=document.getElementById('station'), lastSt=null;
var fwd=new THREE.Vector3(), up=new THREE.Vector3();
function tick(){
  var dt=Math.min(clock.getDelta(),0.05), t=clock.elapsedTime;
  H.t=t;

  if(renderer.xr.isPresenting){
    xrStep(dt);
  } else if(!overview){
    var f=(keys['KeyW']||keys['ArrowUp']?1:0)-(keys['KeyS']||keys['ArrowDown']?1:0);
    var s=(keys['KeyD']?1:0)-(keys['KeyA']?1:0);
    if(keys['KeyQ']||keys['ArrowLeft']) yaw+=1.9*dt;
    if(keys['KeyE']||keys['ArrowRight']) yaw-=1.9*dt;
    var sp=(keys['ShiftLeft']||keys['ShiftRight'])?4.6:2.9;
    var fx=Math.sin(yaw),fz=Math.cos(yaw);
    pos.x+=(fx*f - fz*s)*sp*dt;
    pos.z+=(fz*f + fx*s)*sp*dt;
    collide();
    camera.position.set(pos.x,EYE,pos.z);
    camera.lookAt(pos.x+Math.sin(yaw)*Math.cos(pitch), EYE+Math.sin(pitch), pos.z+Math.cos(yaw)*Math.cos(pitch));
  } else {
    marker.position.x=pos.x; marker.position.z=pos.z; marker.rotation.y=yaw+Math.PI;
  }

  // zones, then content updaters
  if(started){
    for(var i=0;i<zones.length;i++){ var z=zones[i];
      var inside=H.inBox(z.x1,z.z1,z.x2,z.z2) && (!z.when || z.when());
      if(inside && !z.inside){ z.inside=true; if(!(z.once && z.fired)){ z.fired=true; if(z.enter) z.enter(); } }
      else if(!inside && z.inside){ z.inside=false; if(z.exit) z.exit(); }
      if(inside && z.during) z.during(dt,t);
    }
  }
  for(var u=0;u<updaters.length;u++) updaters[u](dt,t);
  for(var k=0;k<screens.length;k++){ var sc=screens[k];
    if(sc.x!=null && !H.near(sc.x,sc.z,sc.range)) continue;
    if((sc.n++)%sc.every===0){ sc.draw(sc.ctx,t,sc.canvas.width,sc.canvas.height); sc.tex.needsUpdate=true; } }
  narrTick(dt);
  renderFeeds();
  if(scareT>0){ scareT-=dt; if(scareT<=0){ scareEl.style.display='none'; hudState.scare=''; } }

  // audio listener follows the head
  if(AC && started){ try{ var L=AC.listener; camera.getWorldPosition(up); camera.getWorldDirection(fwd);
    if(L.positionX){ L.positionX.value=up.x; L.positionY.value=up.y; L.positionZ.value=up.z; L.forwardX.value=fwd.x; L.forwardY.value=fwd.y; L.forwardZ.value=fwd.z; L.upX.value=0; L.upY.value=1; L.upZ.value=0; }
    else { L.setPosition(up.x,up.y,up.z); L.setOrientation(fwd.x,fwd.y,fwd.z,0,1,0); } }catch(e){} }

  // HUD station proximity
  var best=null,bd2=10.5;
  stations.forEach(function(s){ var d=Math.hypot(pos.x-s.x*SC,pos.z-s.z*SC); if(d<bd2){bd2=d;best=s;} });
  if(!(best && bd2<3.4)) best=null;
  if(best!==lastSt){ lastSt=best; stEl.innerHTML=best?'<span class="n">'+best.n+'</span><span class="name">'+best.name+'</span><div class="desc">'+best.desc+'</div>':''; }
  if(renderer.xr.isPresenting){
    var key=(best?best.n:'')+'|'+hudState.who+'|'+hudState.line+'|'+hudState.stage+'|'+hudState.scare;
    if(key!==hudKey){ hudKey=key; drawHud(best); }
    if(wrist.visible && (xr.maps++%4===0)) wristTex.needsUpdate=true;
  }

  // minimap
  mg.clearRect(0,0,mm.width,mm.height);
  mg.drawImage(mmBase,0,0);
  var px=MMX(pos.x/SC), pz=MMZ(pos.z/SC);
  mg.save(); mg.translate(px,pz); mg.rotate(-yaw);
  mg.fillStyle='#3fd47f'; mg.beginPath(); mg.moveTo(0,6); mg.lineTo(-4,-4); mg.lineTo(4,-4); mg.closePath(); mg.fill(); mg.restore();

  renderer.render(scene,overview?ovCamO:camera);
}

// ---------- run (after content scripts have built the hotel) ----------
H.run = function(){
  avatar=H.feedOnly(H.figure(0x3b4658,0xd9c2a4)); avatar.visible=false;   // guests see themselves only on camera and in mirrors
  // bounds from structural walls
  var xs=[],zs=[]; map.walls.concat(map.curtains).forEach(function(w){ xs.push(w[0],w[2]); zs.push(w[1],w[3]); });
  if(xs.length){ B.x1=Math.min.apply(null,xs); B.x2=Math.max.apply(null,xs); B.z1=Math.min.apply(null,zs); B.z2=Math.max.apply(null,zs); }
  var cx=(B.x1+B.x2)/2*SC, cz=(B.z1+B.z2)/2*SC, ex=(B.x2-B.x1)*SC, ez=(B.z2-B.z1)*SC;
  if(!H.noBaseFloor){
    var fm=H.floorMat||H.mat.floor, fg=new THREE.PlaneGeometry(ex+2,ez+2,Math.ceil((ex+2)/0.5),Math.ceil((ez+2)/0.5)); if(fm.map&&fm.map.size) scaleUV(fg,(ex+2)/fm.map.size[0],(ez+2)/fm.map.size[1]);
    var fl=new THREE.Mesh(fg, fm);
    fl.rotation.x=-Math.PI/2; fl.position.set(cx,0,cz); scene.add(fl);
    var ce=new THREE.Mesh(new THREE.PlaneGeometry(ex+2,ez+2,Math.ceil((ex+2)/0.5),Math.ceil((ez+2)/0.5)), H.ceilMat||lam(0x0c0b0f));
    ce.rotation.x=Math.PI/2; ce.position.set(cx,WALL_H,cz); scene.add(ce);
  }
  ovCamO.position.set(cx,40,cz); ovCamO.lookAt(cx,0,cz);
  buildMinimap();
  window.addEventListener('resize',resize); resize();
  document.getElementById('overlay').addEventListener('click',function(){
    begin();
    try{ canvas.requestPointerLock&&canvas.requestPointerLock(); }catch(e){}
  });
  canvas.addEventListener('click',function(){ if(started){ try{ canvas.requestPointerLock&&canvas.requestPointerLock(); }catch(e){} } });
  if(navigator.xr && navigator.xr.isSessionSupported){
    navigator.xr.isSessionSupported('immersive-vr').then(function(ok){ if(!ok) return;
      xr.supported=true;
      document.getElementById('vrgo').style.display='inline-block';
      document.getElementById('vrgo').addEventListener('click',function(e){ e.stopPropagation(); begin(); enterVR(); });
      document.getElementById('vrbtn').addEventListener('click',enterVR);
      if(started) document.getElementById('vrbtn').style.display='block';
    }).catch(function(){});
  }
  if(lightCount>H.budget.lights) console.warn('Hotel Alice Lloyd: '+lightCount+' dynamic lights (Quest budget '+H.budget.lights+')');
  renderer.setAnimationLoop(tick);
  if(/[?&]debug\b/.test(location.search)){   // test hook: drive the walkthrough from the console
    window.HAUNT={H:H,THREE:THREE,scene:scene,camera:camera,rig:rig,renderer:renderer,pos:pos,stations:stations,
      look:function(y,p){ yaw=y; pitch=p||0; }, go:H.teleport,
      begin:begin, skip:H.skip, lights:function(){ return lightCount; },
      state:function(){ return {x:pos.x/SC,z:pos.z/SC,yaw:yaw,xr:renderer.xr.isPresenting,line:hudState.line,stage:hudState.stage}; },
      // walk the route arrows through the real collision code; reports segments where a guest would get stuck
      walkRoute:function(path,step){ path=path||H.PATH||[]; step=step||0.05; var save=pos.clone(), stuck=[], opened=[];
        solids.forEach(function(sd){ if(sd.door && !sd.off){ sd.off=true; opened.push(sd); } });   // doors that open on cue count as open
        if(!path.length) return {stuck:['no PATH']};
        pos.set(path[0][0]*SC,EYE,path[0][1]*SC);
        for(var i=1;i<path.length;i++){ var tx=path[i][0]*SC, tz=path[i][1]*SC, n=0, best=1e9, still=0;
          while(n++<4000){ var dx=tx-pos.x, dz=tz-pos.z, d=Math.hypot(dx,dz); if(d<0.12) break;
            pos.x+=dx/d*step; pos.z+=dz/d*step; collide();
            if(d<best-0.002){ best=d; still=0; } else if(++still>60){ stuck.push({seg:i,from:path[i-1],to:path[i],at:[Math.round(pos.x/SC),Math.round(pos.z/SC)],left:+(d/SC).toFixed(1)}); pos.set(tx,EYE,tz); break; } } }
        opened.forEach(function(sd){ sd.off=false; }); pos.copy(save); return {segments:path.length-1,stuck:stuck}; }};
  }
};
})();
