(()=>{
const $=id=>document.getElementById(id);let img=null,a=0,fx=false,fy=false,src="image/jpeg",base="image",url=null;
const drop=$("rdrop"),file=$("rfile"),cv=$("rcv");
const err=m=>{const e=$("rerr");e.textContent=m||"";e.hidden=!m};
const fmt=n=>n>=1048576?(n/1048576).toFixed(2)+" MB":(n/1024).toFixed(1)+" KB";
$("rpick").onclick=e=>{e.stopPropagation();file.click()};
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
 i.onload=()=>{img=i;a=0;fx=fy=false;src=f.type==="image/png"?"image/png":(f.type==="image/webp"?"image/webp":"image/jpeg");base=f.name.replace(/\.[^.]+$/,"")||"image";$("rname").textContent=f.name+" · "+i.naturalWidth+"×"+i.naturalHeight+" · "+fmt(f.size);$("rwrap").style.display="block";render()};
 i.onerror=()=>err("This image could not be opened. Try another file.");
 i.src=URL.createObjectURL(f);
}
function render(){
 const w=img.naturalWidth,h=img.naturalHeight,sw=a%180!==0;
 cv.width=sw?h:w;cv.height=sw?w:h;
 const x=cv.getContext("2d");x.save();if(src==="image/jpeg"){x.fillStyle="#fff";x.fillRect(0,0,cv.width,cv.height)}
 x.translate(cv.width/2,cv.height/2);x.rotate(a*Math.PI/180);x.scale(fx?-1:1,fy?-1:1);x.drawImage(img,-w/2,-h/2);x.restore();
 cv.toBlob(b=>{if(!b){err("Could not prepare the image. Try a smaller one.");return}if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(b);const ext={"image/png":"png","image/webp":"webp","image/jpeg":"jpg"}[src];$("rdl").href=url;$("rdl").download=base+"-edited."+ext;$("rinfo").textContent=cv.width+"×"+cv.height+" · "+fmt(b.size)},src,.95);
}
const on=(id,fn)=>$(id).onclick=()=>{if(!img)return;fn();render()};
on("rl",()=>a=(a+270)%360);on("rr",()=>a=(a+90)%360);on("fh",()=>fx=!fx);on("fv",()=>fy=!fy);on("rz",()=>{a=0;fx=fy=false});
})();
