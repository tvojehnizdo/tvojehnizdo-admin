import React from "react";
export default function ChatDock(){
  const [open,setOpen]=React.useState(false);
  return (<>
    <button onClick={()=>setOpen(true)}
      style={{position:"fixed",right:16,bottom:16,padding:"10px 14px",borderRadius:999,background:"#000",color:"#fff",zIndex:50}}>
      AI poradce
    </button>
    {open && (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:60}} onClick={()=>setOpen(false)}>
        <div style={{position:"absolute",right:16,bottom:72,width:420,maxWidth:"95vw",height:560,background:"#fff",
                     borderRadius:16,overflow:"hidden",boxShadow:"0 8px 30px rgba(0,0,0,.3)"}} onClick={(e)=>e.stopPropagation()}>
          <iframe src="/ai-chat-embed" style={{border:0,width:"100%",height:"100%"}}/>
        </div>
      </div>
    )}
  </>);
}
