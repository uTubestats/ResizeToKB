(function(){
const $=id=>document.getElementById(id);
const mb=$('mb');if(mb)mb.onclick=()=>{const o=$('nav').classList.toggle('open');mb.setAttribute('aria-expanded',o)};
const T=$('tool');if(!T)return;
const PRE={'Instagram post (1080×1080)':[1080,1080],'Instagram story (1080×1920)':[1080,1920],'YouTube thumbnail (1280×720)':[1280,720],'Facebook link image (1200×630)':[1200,630],'Facebook cover (820×312)':[820,312],'WhatsApp DP (400×400)':[400,400],'Passport photo (413×531)':[413,531]};
let img=null,base='image',mode=T.dataset.mode||'px',url=null;
const st=(t,c)=>{$('st').textContent=t;$('st').className=c||''};
function setMode(m){mode=m;document.querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));['px','pct','kb'].forEach(k=>$('g-'+k).hidden=k!==m)}
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
const ps=$('pre');ps.innerHTML='<option value="">Custom size</option>'+Object.keys(PRE).map(k=>`<option>${k}</option>`).join('');
ps.onchange=()=>{const p=PRE[ps.value];if(p){$('w').value=p[0];$('h').value=p[1];$('ratio').checked=false}};
if(T.dataset.w){$('w').value=T.dataset.w;$('h').value=T.dataset.h}
if(T.dataset.kb)$('kb').value=T.dataset.kb;
if(T.dataset.pre)ps.value=T.dataset.pre;
$('w').oninput=()=>{if($('ratio').checked&&img)$('h').value=Math.round($('w').value*img.height/img.width)};
$('h').oninput=()=>{if($('ratio').checked&&img)$('w').value=Math.round($('h').value*img.width/img.height)};
setMode(mode);
$('file').onchange=e=>{const f=e.target.files[0];if(!f)return;
if(!/^image\/(jpeg|png|webp|gif)$/.test(f.type)){st('Please choose a JPG, PNG, WebP or GIF image.','err');return}
if(f.size>40*1024*1024){st('This file is over 40 MB. Please choose a smaller image.','err');return}
const u=URL.createObjectURL(f),i=new Image();
i.onload=()=>{img=i;base=f.name.replace(/\.[^.]+$/,'')||'image';$('go').disabled=false;$('fn').textContent=f.name+' – '+i.width+'×'+i.height+'px, '+(f.size/1024).toFixed(1)+' KB';st('Image loaded. Choose your size and press Resize.','okc');if(ps.value===''&&!T.dataset.w&&!$('w').value){$('w').value=i.width;$('h').value=i.height}};
i.onerror=()=>st('This image could not be read. Try another file.','err');i.src=u};
const blob=(cv,t,q)=>new Promise(r=>cv.toBlob(r,t,q));
function draw(w,h,t){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(t!=='image/png'){x.fillStyle='#fff';x.fillRect(0,0,w,h)}x.imageSmoothingQuality='high';x.drawImage(img,0,0,w,h);return c}
$('go').onclick=async()=>{
if(!img){st('Select an image first.','err');return}
let t=$('fmt').value,w=img.width,h=img.height,out;
$('go').disabled=true;st('Resizing…');
try{
if(mode==='px'){w=Math.round(+$('w').value);h=Math.round(+$('h').value);if(!(w>0&&h>0)||w>8000||h>8000)throw'Enter a width and height between 1 and 8000 pixels.';out=await blob(draw(w,h,t),t,.92)}
else if(mode==='pct'){const p=+$('pct').value;if(!(p>0&&p<=400))throw'Enter a percentage between 1 and 400.';w=Math.round(img.width*p/100);h=Math.round(img.height*p/100);if(w>8000||h>8000)throw'That result would be larger than 8000 pixels.';out=await blob(draw(w,h,t),t,.92)}
else{const kb=+$('kb').value;if(!(kb>=5))throw'Enter a target size of at least 5 KB.';const tg=kb*1024;if(t==='image/png')t='image/jpeg';let s=1,ok=null;
for(let a=0;a<30&&!ok;a++){const cw=Math.max(16,Math.round(img.width*s)),ch=Math.max(16,Math.round(img.height*s)),c=draw(cw,ch,t);let lo=.1,hi=.95,best=null;
for(let k=0;k<7;k++){const q=(lo+hi)/2,b=await blob(c,t,q);if(b.size<=tg){best=b;lo=q}else hi=q}
if(best){ok=best;w=cw;h=ch}else s*=.85}
if(!ok)throw'Could not reach that size. Try a larger target.';out=ok}
if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(out);
$('pv').src=url;$('pv').hidden=false;const d=$('dl');d.href=url;d.download=base+'-resized.'+(t==='image/png'?'png':t==='image/webp'?'webp':'jpg');d.hidden=false;
st('Done: '+w+'×'+h+'px, '+(out.size/1024).toFixed(1)+' KB. Your image never left your device.','okc')}
catch(e){st(typeof e==='string'?e:'Something went wrong. Try a smaller image.','err')}
$('go').disabled=false};
})();
