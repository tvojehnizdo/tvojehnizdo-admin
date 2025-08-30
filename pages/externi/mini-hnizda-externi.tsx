import Head from "next/head"

export default function IframePage() {
  return (
    <div className="w-full h-screen">
      <Head>
        <title>Mini hnízda – externí náhled</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{height:"48px",display:"flex",alignItems:"center",gap:"12px",padding:"8px 16px",borderBottom:"1px solid #e5e7eb"}}>
        <strong style={{fontFamily:"system-ui"}}>Mini hnízda</strong>
        <a href="https://tvojehnizdo.webnode.cz/mini-hnizda/" target="_blank" rel="noreferrer" style={{textDecoration:"underline",fontSize:14,color:"#2563eb"}}>Otevřít na Webnode</a>
      </div>
      <iframe
        src="https://tvojehnizdo.webnode.cz/mini-hnizda/"
        title="Mini hnízda"
        style={{width:"100%",height:"calc(100vh - 48px)",border:"0"}}
        loading="eager"
      />
    </div>
  )
}
