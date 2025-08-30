import Head from "next/head"
import { fetchWebnode } from "@/lib/webnode"

export async function getServerSideProps() {
  const url = "https://tvojehnizdo.webnode.cz/mini-hnizda/"
  try {
    const html = await fetchWebnode(url)
    return { props: { html, url } }
  } catch (e:any) {
    return { props: { html: "<div style='padding:2rem;color:#b91c1c;'>Chyba načtení externího obsahu.</div>", url } }
  }
}

export default function BridgePage({ html, url }: { html: string, url: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Mini hnízda – externí náhled</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="mb-4 text-sm text-gray-500">
        Zdroj: <a className="underline" href={url} target="_blank" rel="noreferrer">{url}</a>
      </div>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
