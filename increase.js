(()=>{
const $=id=>document.getElementById(id);let img=null,url=null;
const drop=$("idrop"),file=$("ifile");
$("ipick").onclick=e=>{e.stopPropagation();file.click()};
drop.onclick=()=>file.click();
drop.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();file.click()}};
["dragover","dragenter"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("on")}));
["dragleave","drop"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove("on")}));
drop.addEventListener("drop",e=>load(e.dataTransfer.files[0]));
file.onchange=()=>load(file.files[0]);
function load(f){
 if(!f||!f.type.startsWith("image/"))return;
 const i=new Image();
 i.onload=()=>{img=i;$("igo").disabled=false;$("iname").textContent=f.name+" · "+i.naturalWidth+"×"+i.naturalHeight;$("iout").style.display="none"};
 i.src=URL.createObjectURL(f);
}
const fmt=n=>n>=1048576?(n/1048576).toFixed(2)+" MB":(n/1024).toFixed(1)+" KB";
function pad(buf,extra){
 const src=new Uint8Array(buf);
 if(src[0]!==0xFF||src[1]!==0xD8)return src;
 const segs=[];let left=extra;
 while(left>0){const l=Math.min(left,65000);segs.push(l);left-=l}
 const out=new Uint8Array(src.length+segs.reduce((a,l)=>a+l+4,0));
 out.set(src.subarray(0,2),0);let o=2;
 for(const l of segs){out[o++]=0xFF;out[o++]=0xFE;const L=l+2;out[o++]=L>>8;out[o++]=L&255;out.fill(0x20,o,o+l);o+=l}
 out.set(src.subarray(2),o);
 return out;
}
$("igo").onclick=async()=>{
 if(!img)return;
 const target=Math.min(Math.max(+$("ikb").value||50,1),10000)*1024;
 $("igo").disabled=true;$("igo").textContent="Working…";
 const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
 const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0);
 let blob=await new Promise(r=>c.toBlob(r,"image/jpeg",1));
 let msg="";
 if(blob.size<target){
  const buf=await blob.arrayBuffer();
  blob=new Blob([pad(buf,target-blob.size)],{type:"image/jpeg"});
  msg="Result size: "+fmt(blob.size)+" (minimum met)";
 }else{
  msg="Result size: "+fmt(blob.size)+". The image was already larger than your minimum.";
 }
 if(url)URL.revokeObjectURL(url);
 url=URL.createObjectURL(blob);
 $("iprev").src=url;$("idl").href=url;$("iinfo").textContent=msg;
 $("iout").style.display="block";$("igo").disabled=false;$("igo").textContent="Increase Size";
};
})();
