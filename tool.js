
(()=>{
const $=id=>document.getElementById(id);
let img=null,mode="px",ratio=1,url=null;
const D=document.body.dataset;const drop=$("drop"),file=$("file");
$("pick").onclick=e=>{e.stopPropagation();file.click()};
drop.onclick=()=>file.click();
drop.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();file.click()}};
["dragover","dragenter"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("on")}));
["dragleave","drop"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove("on")}));
drop.addEventListener("drop",e=>load(e.dataTransfer.files[0]));
file.onchange=()=>load(file.files[0]);
function load(f){
 if(!f||!f.type.startsWith("image/"))return;
 const i=new Image();
 i.onload=()=>{img=i;ratio=i.width/i.height;if(!D.w){$("w").value=i.width;$("h").value=i.height}$("go").disabled=false;drop.querySelector("p").textContent=f.name+" · "+i.width+"×"+i.height;$("out").style.display="none"};
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
$("go").onclick=async()=>{
 if(!img)return;
 const t=$("fmt").value;let w=img.width,h=img.height,blob;
 $("go").disabled=true;$("go").textContent="Resizing…";
 if(mode==="px"){w=+$("w").value||w;h=+$("h").value||h}
 if(mode==="kb"&&D.w){w=+D.w;h=+D.h}
 if(mode==="pct"){const p=(+$("pct").value||100)/100;w*=p;h*=p}
 if(mode!=="kb"){blob=await blobOf(draw(w,h,t),t,.92)}
 else{
  const max=(+$("kb").value||100)*1024;let s=1;
  for(let n=0;n<8;n++){
   const c=draw(w*s,h*s,t);
   if(t==="image/png"){blob=await blobOf(c,t)}
   else{let lo=.05,hi=.95;for(let k=0;k<7;k++){const m=(lo+hi)/2;blob=await blobOf(c,t,m);blob.size>max?hi=m:lo=m}blob=await blobOf(c,t,lo)}
   if(blob.size<=max)break;s*=.8;
  }
 }
 if(url)URL.revokeObjectURL(url);
 url=URL.createObjectURL(blob);
 const ext={"image/jpeg":"jpg","image/webp":"webp","image/png":"png"}[t];
 
 $("prev").src=url;$("dl").href=url;$("dl").download="resized-image."+ext;
 $("info").textContent="Result size: "+(blob.size/1024).toFixed(1)+" KB";
 $("out").style.display="block";$("go").disabled=false;$("go").textContent="Resize Image";
};
if(D.mode==='kb'){document.querySelector('[data-m=kb]').click();$('kb').value=D.kb}
if(D.w){$('w').value=D.w;$('h').value=D.h;$('lock').checked=false}
})();
