import Link from "next/link"
import { categories } from "@/lib/house-data"

export default function TypoveDomyIndex() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Typové domy</h1>
      <p className="text-lg text-gray-600 mb-8">
        Vyberte si kategorii, která vám nejlépe vyhovuje. Obrázky stačí doplnit do <code>/public/images/</code>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <Link key={cat.key} href={cat.href} className="block rounded-2xl border p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{cat.title}</h2>
            <p className="text-gray-600">{cat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
