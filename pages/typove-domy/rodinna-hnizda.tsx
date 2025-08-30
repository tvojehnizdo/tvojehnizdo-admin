import { houses } from "@/lib/house-data"
import { HouseCard } from "@/components/HouseCard"

export default function RodinnaHnizda() {
  const items = houses.filter(h => h.category === 'rodinna')
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Rodinná hnízda</h1>
      <p className="text-lg text-gray-600 mb-8">Přehled domů v kategorii. Nahrajte obrázky do <code>/public/images/</code>.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(house => (
          <HouseCard key={house.id} house={house} />
        ))}
      </div>
    </div>
  )
}
