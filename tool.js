(()=>{
const $=id=>document.getElementById(id);
const L=window.I18N||{};const T=(k,d)=>L[k]||d;
let img=null,mode="px",ratio=1,url=null,orig=0;
const D=document.body.dataset;const drop=$("drop"),file=$("file"),dropP=drop.querySelector("p"),goTxt=$("go").textContent;
const err=m=>{const e=$("err");if(e){e.textContent=m||"";e.hidden=!m}};
const sz=n=>n>=1048576?(n/1048576).toFixed(2)+" MB":(n/1024).toFixed(1)+" KB";
$("pick").onclick=e=>{e.stopPropagation();file.click()};
drop.onclick=()=>file.click();
["dragover","dragenter"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("on")}));
["dragleave","drop"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove("on")}));
drop.addEventListener("drop",e=>load(e.dataTransfer.files[0]));
file.onchange=()=>load(file.files[0]);
function load(f){
 err("");if(!f)return;
 const ext=(f.name.split(".").pop()||"").toLowerCase();
 if(/^(heic|heif)$/.test(ext)||/hei[cf]/.test(f.type)){err(T("errHeic","This is a HEIC photo, which browsers cannot open. On iPhone, go to Settings > Camera > Formats > Most Compatible, or share the photo as a JPG."));return}
 if(!f.type.startsWith("image/")){err(T("errType","This file is not an image. Choose a JPG, PNG, or WebP file."));return}
 const i=new Image();
 i.onload=()=>{
  img=i;orig=f.size;ratio=i.width/i.height;
  if(!D.w){$("w").value=i.width;$("h").value=i.height}
  $("go").disabled=false;dropP.textContent=f.name+" · "+i.width+"×"+i.height+" · "+sz(f.size);$("out").style.display="none";
  if(i.width*i.height>80e6)err(T("errBig","This image is very large and may not process on a phone. If it fails, try a smaller photo."));
 };
 i.onerror=()=>err(T("errOpen","This image could not be opened. Try another file, or save it as a JPG first."));
 i.src=URL.createObjectURL(f);
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{
 mode=b.dataset.m;
 document.querySelectorAll(".tabs button").forEach(x=>x.setAttribute("aria-selected",x===b));
 ["px","pct","kb"].forEach(m=>$("m-"+m).hidden=m!==mode);
});
$("preset").onchange=e=>{const v=e.target.value;if(v){const[a,b]=v.split("x");$("w").value=a;$("h").value=b;$("lock").checked=false}};
$("w").oninput=()=>{if($("lock").checked&&img)$("h").value=Math.round($("w").value/ratio)};
$("h").oninput=()=>{if($("lock").checked&&img)$("w").value=Math.round($("h").value*ratio)};
const blobOf=(c,t,q)=>new Promise(r=>c.toBlob(r,t,q));
function draw(w,h,t){
 const c=document.createElement("canvas");c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));
 const x=c.getContext("2d");
 if(t==="image/jpeg"){x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}
 x.imageSmoothingQuality="high";if(D.w){const s=Math.max(c.width/img.width,c.height/img.height),dw=img.width*s,dh=img.height*s;x.drawImage(img,(c.width-dw)/2,(c.height-dh)/2,dw,dh)}else x.drawImage(img,0,0,c.width,c.height);return c;
}
const reset=()=>{$("go").disabled=false;$("go").textContent=goTxt};
$("go").onclick=async()=>{
 if(!img)return;err("");
 const t=$("fmt").value;let w=img.width,h=img.height,blob=null;
 $("go").disabled=true;$("go").textContent=T("resizing","Resizing…");
 try{
  if(mode==="px"){w=+$("w").value||w;h=+$("h").value||h}
  if(mode==="kb"&&D.w){w=+D.w;h=+D.h}
  if(mode==="pct"){const p=(+$("pct").value||100)/100;w*=p;h*=p}
  if(mode!=="kb"){blob=await blobOf(draw(w,h,t),t,.92)}
  else{
   const max=(+$("kb").value||100)*1024;
   const fixed=!!D.w;
   const scales=fixed?[1]:[1,.85,.7,.55,.45,.35,.28,.22,.17,.13,.1,.07,.05];
   const minQ=fixed?.05:.5;
   for(let n=0;n<scales.length;n++){
    const c=draw(w*scales[n],h*scales[n],t);
    if(t==="image/png"){blob=await blobOf(c,t);if(!blob||blob.size<=max)break;continue}
    blob=await blobOf(c,t,minQ);
    if(!blob||blob.size>max){if(n===scales.length-1)break;continue}
    let lo=minQ,hi=.95;
    for(let k=0;k<7;k++){const m=(lo+hi)/2;const bb=await blobOf(c,t,m);if(bb&&bb.size>max)hi=m;else if(bb){lo=m;blob=bb}}
    break;
   }
  }
 }catch(e){blob=null}
 if(!blob){err(T("errFail","Something went wrong while resizing. Try a smaller image or a different format."));reset();return}
 if(url)URL.revokeObjectURL(url);
 url=URL.createObjectURL(blob);
 const ext={"image/jpeg":"jpg","image/webp":"webp","image/png":"png"}[t];
 $("prev").src=url;$("dl").href=url;$("dl").download="resized-image."+ext;
 const ch=orig?Math.round((blob.size-orig)/orig*100):0;
 $("info").textContent=T("result","Result size")+": "+sz(blob.size)+" · "+T("was","Original")+": "+sz(orig)+" ("+(ch>0?"+":"")+ch+"%)";
 $("out").style.display="block";reset();
};
if(D.mode==='kb'){document.querySelector('[data-m=kb]').click();$('kb').value=D.kb}
if(D.mode==='pct'){document.querySelector('[data-m=pct]').click()}
if(D.w){$('w').value=D.w;$('h').value=D.h;$('lock').checked=false}
})();
