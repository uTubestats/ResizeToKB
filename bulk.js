(()=>{
const $=id=>document.getElementById(id);let files=[],results=[];
const drop=$("bdrop"),input=$("bfile");
const err=m=>{const e=$("berr");e.textContent=m||"";e.hidden=!m};
const fmt=n=>n>=1048576?(n/1048576).toFixed(2)+" MB":(n/1024).toFixed(1)+" KB";
$("bpick").onclick=e=>{e.stopPropagation();input.click()};
drop.onclick=()=>input.click();
["dragover","dragenter"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("on")}));
["dragleave","drop"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove("on")}));
drop.addEventListener("drop",e=>setFiles(e.dataTransfer.files));
input.onchange=()=>setFiles(input.files);
function setFiles(fl){err("");files=[...fl].filter(f=>f.type.startsWith("image/")&&!/hei[cf]/.test(f.type));if(!files.length){err("No usable images found. Choose JPG, PNG, or WebP files. HEIC is not supported by browsers.");$("bgo").disabled=true;return}
 if(files.length>50){files=files.slice(0,50);err("Only the first 50 images are used.")}
 $("bname").textContent=files.length+" image"+(files.length>1?"s":"")+" selected";$("bgo").disabled=false;$("blist").innerHTML="";$("bzip").hidden=true;results=[]}
const modes=()=>{const m=$("bmode").value;$("bw-row").hidden=m!=="px";$("bp-row").hidden=m!=="pct";$("bk-row").hidden=m!=="kb"};
$("bmode").onchange=modes;modes();
const blobOf=(c,t,q)=>new Promise(r=>c.toBlob(r,t,q));
const load=f=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(f)});
function draw(i,w,h,t){const c=document.createElement("canvas");c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));const x=c.getContext("2d");if(t==="image/jpeg"){x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}x.imageSmoothingQuality="high";x.drawImage(i,0,0,c.width,c.height);return c}
async function one(f,o){
 const i=await load(f);let w=i.naturalWidth,h=i.naturalHeight,blob=null;const t=o.t;
 if(o.m==="px"){const nw=o.w||w;h=h*nw/w;w=nw}
 if(o.m==="pct"){w*=o.p;h*=o.p}
 if(o.m!=="kb")blob=await blobOf(draw(i,w,h,t),t,.92);
 else{const max=o.k*1024,sc=[1,.85,.7,.55,.45,.35,.28,.22,.17,.13,.1,.07,.05];
  for(let n=0;n<sc.length;n++){const c=draw(i,w*sc[n],h*sc[n],t);
   if(t==="image/png"){blob=await blobOf(c,t);if(!blob||blob.size<=max)break;continue}
   blob=await blobOf(c,t,.5);if(!blob||blob.size>max){if(n===sc.length-1)break;continue}
   let lo=.5,hi=.95;for(let k=0;k<7;k++){const m=(lo+hi)/2;const bb=await blobOf(c,t,m);if(bb&&bb.size>max)hi=m;else if(bb){lo=m;blob=bb}}break}}
 URL.revokeObjectURL(i.src);if(!blob)throw 0;return blob}
const T=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[n]=c>>>0}
const crc=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=T[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function zip(fs){const enc=new TextEncoder(),parts=[],cd=[];let off=0;const d=new Date();const tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),dt=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
 for(const f of fs){const nm=enc.encode(f.name),c=crc(f.data),L=f.data.length;
  const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(10,tm,true);lh.setUint16(12,dt,true);lh.setUint32(14,c,true);lh.setUint32(18,L,true);lh.setUint32(22,L,true);lh.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(lh.buffer),nm,f.data);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(12,tm,true);ch.setUint16(14,dt,true);ch.setUint32(16,c,true);ch.setUint32(20,L,true);ch.setUint32(24,L,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
  cd.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+L}
 const sz=cd.reduce((a,b)=>a+b.length,0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,fs.length,true);e.setUint16(10,fs.length,true);e.setUint32(12,sz,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cd,new Uint8Array(e.buffer)],{type:"application/zip"})}
$("bgo").onclick=async()=>{
 if(!files.length)return;err("");$("bgo").disabled=true;$("blist").innerHTML="";results=[];
 const o={m:$("bmode").value,t:$("bfmt").value,w:+$("bw").value||0,p:(+$("bp").value||50)/100,k:+$("bk").value||100};
 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[o.t],used={};
 for(let n=0;n<files.length;n++){
  const f=files[n];$("bname").textContent="Processing "+(n+1)+" of "+files.length+"…";
  const li=document.createElement("li");
  try{const b=await one(f,o);let nm=f.name.replace(/\.[^.]+$/,"")+"-resized";used[nm]=(used[nm]||0)+1;if(used[nm]>1)nm+="-"+used[nm];nm+="."+ext;
   const u=URL.createObjectURL(b);results.push({name:nm,blob:b});
   li.innerHTML="";const a=document.createElement("a");a.href=u;a.download=nm;a.textContent=nm;li.append(a," · "+fmt(f.size)+" → "+fmt(b.size))}
  catch(e){li.textContent=f.name+" · could not be processed"}
  $("blist").append(li)}
 $("bname").textContent="Done: "+results.length+" of "+files.length+" resized";$("bgo").disabled=false;
 if(results.length>1){$("bzip").hidden=false}
};
$("bzip").onclick=async()=>{
 const fs=[];for(const r of results)fs.push({name:r.name,data:new Uint8Array(await r.blob.arrayBuffer())});
 const z=zip(fs),a=document.createElement("a");a.href=URL.createObjectURL(z);a.download="resized-images.zip";a.click()};
})();
