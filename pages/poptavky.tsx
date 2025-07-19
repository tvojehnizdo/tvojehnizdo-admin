import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// DEMO DATA – bude se načítat z Google Sheets nebo backendu
const mockPoptavky = [
  {
    datum: "2025-07-19",
    jmeno: "Jan Novák",
    email: "jan@example.com",
    poznamka: "Mám zájem o modul 4x8 m.",
    konfigurace: "typ: A, podlaha: vinyl, izolace: standard",
    stav: "Nová"
  },
  {
    datum: "2025-07-18",
    jmeno: "Eva Dvořáková",
    email: "eva@example.com",
    poznamka: "Chci nabídku s montáží",
    konfigurace: "typ: B, podlaha: dřevo, izolace: plus",
    stav: "Řešeno"
  }
];

export default function PoptavkyPage() {
  const [poptavky] = useState(mockPoptavky);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Poptávky</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {poptavky.map((p, i) => (
          <Card key={i} className="hover:shadow-md transition-all">
            <CardContent className="p-4 space-y-2">
              <div className="text-sm text-muted-foreground">{p.datum}</div>
              <div className="font-semibold">{p.jmeno}</div>
              <div className="text-sm">{p.email}</div>
              <div className="text-sm">{p.poznamka}</div>
              <div className="text-sm italic">{p.konfigurace}</div>
              <div className="text-xs uppercase font-medium text-blue-600">{p.stav}</div>
              <Button variant="outline" className="w-full text-sm">
                Zobrazit detail
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

