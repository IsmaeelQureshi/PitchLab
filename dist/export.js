export function exportMatch(shots, documentRef=document, urlAPI=URL) {
 const blob=new Blob([JSON.stringify(shots,null,2)],{type:'application/json'});
 const url=urlAPI.createObjectURL(blob);
 const link=documentRef.createElement('a');
 link.href=url;link.download='pitchlab-match.json';
 documentRef.body.append(link);
 try{link.click();}finally{
  link.remove();
  setTimeout(()=>urlAPI.revokeObjectURL(url),1000);
 }
 return blob;
}
