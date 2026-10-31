(()=>{
const $=id=>document.getElementById(id);let img=null,url=null,orig=0,base="image";
const drop=$("cdrop"),file=$("cfile");
const err=m=>{const e=$("cerr");e.textContent=m||"";e.hidden=!m};
const fmt=n=>n>=1048576?(n/1048576).toFixed(2)+" MB":(n/1024).toFixed(1)+" KB";
if(document.body.dataset.to)$("cto").value=document.body.dataset.to;
$("cpick").onclick=e=>{e.stopPropagation();file.click()};
drop.onclick=()=>file.click();
["dragover","dragenter"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("on")}));
["dragleave","drop"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove("on")}));
drop.addEventListener("drop",e=>load(e.dataTransfer.files[0]));
file.onchange=()=>load(file.files[0]);
function load(f){
 err("");if(!f)return;
 const ext=(f.name.split(".").pop()||"").toLowerCase();
 if(/^(heic|heif)$/.test(ext)||/hei[cf]/.test(f.type)){err("This is a HEIC photo, which browsers cannot open. On iPhone, go to Settings > Camera > Formats > Most Compatible, or share the photo as a JPG.");return}
 if(!f.type.startsWith("image/")){err("This file is not an image. Choose a JPG, PNG, or WebP file.");return}
 const i=new Image();
 i.onload=()=>{img=i;orig=f.size;base=f.name.replace(/\.[^.]+$/,"")||"image";$("cgo").disabled=false;$("cname").textContent=f.name+" · "+i.naturalWidth+"×"+i.naturalHeight+" · "+fmt(f.size);$("cout").style.display="none"};
 i.onerror=()=>err("This image could not be opened. Try another file.");
 i.src=URL.createObjectURL(f);
}
$("cgo").onclick=async()=>{
 if(!img)return;err("");
 const t=$("cto").value,q=Math.min(Math.max(+$("cq").value||92,30),100)/100;
 $("cgo").disabled=true;let blob=null;
 try{
  const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
  const x=c.getContext("2d");if(t==="image/jpeg"){x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}
  x.drawImage(img,0,0);blob=await new Promise(r=>c.toBlob(r,t,q));
 }catch(e){blob=null}
 $("cgo").disabled=false;
 if(!blob){err("Conversion failed. Try a smaller image.");return}
 if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);
 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[t];
 $("cprev").src=url;$("cdl").href=url;$("cdl").download=base+"."+ext;
 $("cinfo").textContent="Converted to "+ext.toUpperCase()+": "+fmt(blob.size)+" · Original: "+fmt(orig);
 $("cout").style.display="block";
};
})();
