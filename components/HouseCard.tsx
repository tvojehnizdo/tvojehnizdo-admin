import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import type { House } from "@/lib/house-data"

export function HouseCard({ house }: { house: House }) {
  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader>
        <img
          src={house.image}
          alt={house.name}
          className="rounded-2xl w-full h-48 object-cover"
        />
        <CardTitle className="mt-4">{house.name}</CardTitle>
        <p className="text-sm text-gray-500">{house.size} • {house.area} m²</p>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-gray-700">{house.description}</p>
        <p className="font-semibold">{house.priceFrom}</p>
        <Link
          href={`/typove-domy/${house.id}`}
          className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
        >
          Detail domu
        </Link>
      </CardContent>
    </Card>
  )
}
