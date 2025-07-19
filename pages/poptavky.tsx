"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import emailjs from "emailjs-com";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

const mockData = [
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
    poznamka: "Chci nabídku s montáží.",
    konfigurace: "typ: B, podlaha: dřevo, izolace: plus",
    stav: "Řešeno"
  }
];

export default function PoptavkyPage() {
  const [data, setData] = useState(mockData);
  const [ai, setAI] = useState<string>("");

  const exportCSV = () => {
    const headers = ["Datum", "Jméno", "Email", "Poznámka", "Konfigurace", "Stav"];
    const rows = data.map(p =>
      [p.datum, p.jmeno, p.email, p.poznamka, p.konfigurace, p.stav]
    );
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "poptavky.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendEmail = (email: string, name: string) => {
    emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: email,
        user_name: name,
        message: "Děkujeme za váš zájem! Brzy se vám ozveme."
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    )
    .then(() => alert("Email odeslán ✅"))
    .catch(() => alert("Chyba při odesílání emailu ❌"));
  };

  const sumarizuj = async (text: string) => {
    const res = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Jsi AI, která shrnuje poptávky zákazníků." },
        { role: "user", content: text }
      ]
    });
    setAI(res.choices[0].message.content || "");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📋 Poptávky</h1>
        <Button onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {ai && <div className="p-4 bg-gray-100 border rounded">{ai}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((p, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2 text-sm">
              <div><strong>{p.jmeno}</strong> ({p.email})</div>
              <div>{p.poznamka}</div>
              <div className="italic">{p.konfigurace}</div>
              <div className="text-xs text-muted-foreground">{p.datum}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => sendEmail(p.email, p.jmeno)}>✉️ Odeslat</Button>
                <Button size="sm" variant="outline" onClick={() => sumarizuj(p.poznamka)}>🧠 Shrni</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}