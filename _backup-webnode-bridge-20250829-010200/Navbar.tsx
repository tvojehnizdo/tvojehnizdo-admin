import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-green-700">
          Tvoje Hnízdo
        </Link>

        {/* Menu */}
        <div className="flex gap-6 items-center">
          <Link href="/o-nas" className="hover:text-green-600">O nás</Link>
          <Link href="/dotace" className="hover:text-green-600">Dotace</Link>
          <Link href="/magazin" className="hover:text-green-600">Magazín</Link>
          <Link href="/kontakt" className="hover:text-green-600">Kontakt</Link>

          {/* Typové domy dropdown */}
          <div className="group relative">
            <button className="hover:text-green-600">
              Typové domy ▾
            </button>
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 p-3 space-y-2 z-50">
              <Link href="/typove-domy" className="block hover:text-green-600">Přehled</Link>
              <Link href="/typove-domy/rodinna-hnizda" className="block hover:text-green-600">Rodinná hnízda</Link>
              <Link href="/typove-domy/mini-hnizda" className="block hover:text-green-600">Mini hnízda</Link>
              <Link href="/typove-domy/luxusni-hnizda" className="block hover:text-green-600">Luxusní hnízda</Link>
              <Link href="/typove-domy/rekreacni-hnizda" className="block hover:text-green-600">Rekreační hnízda</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
