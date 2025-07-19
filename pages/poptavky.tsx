import { useEffect, useState } from 'react';
import emailjs from 'emailjs-com';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

interface Poptavka {
  datum: string;
  jmeno: string;
  email: string;
  poznamka: string;
  konfigurace: string;
  stav: string;
}

export default function PoptavkyPage() {
  const [poptavky, setPoptavky] = useState<Poptavka[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Poptavka | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/poptavky');
      const data = await res.json();
      setPoptavky(data.map((p: any) => ({ ...p, stav: 'Nová' })));
    }
    fetchData();
  }, []);

  const filtered = poptavky.filter(p =>
    `${p.jmeno} ${p.email} ${p.poznamka} ${p.konfigurace}`.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['datum', 'jmeno', 'email', 'poznamka', 'konfigurace', 'stav'];
    const rows = filtered.map(p => [p.datum, p.jmeno, p.email, p.poznamka, p.konfigurace, p.stav]);
    const csv = [headers, ...rows].map(row => row.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poptavky.csv';
    a.click();
  };

  const sendAIEmail = async (p: Poptavka) => {
    setLoading(true);
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Jsi AI asistent pro psaní odpovědí na poptávky.' },
        { role: 'user', content: `Vygeneruj odpověď zákazníkovi: ${p.poznamka}` },
      ],
      model: 'gpt-4',
    });
    setAiText(response.choices[0].message.content || 'Nelze vygenerovat.');
    setLoading(false);
  };

  const changeStav = (i: number, novyStav: string) => {
    const updated = [...poptavky];
    updated[i].stav = novyStav;
    setPoptavky(updated);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Poptávky</h1>
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Hledat..."
          className="border px-2 py-1 w-1/2"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-1 rounded text-sm">
          Exportovat CSV
        </button>
      </div>

      {selected && (
        <div className="border p-4 mb-4 bg-gray-100 rounded relative">
          <button onClick={() => setSelected(null)} className="absolute top-1 right-2 text-sm">✖</button>
          <h2 className="text-lg font-semibold mb-2">Detail poptávky</h2>
          <p><strong>Jméno:</strong> {selected.jmeno}</p>
          <p><strong>Email:</strong> {selected.email}</p>
          <p><strong>Poznámka:</strong> {selected.poznamka}</p>
          <p><strong>Konfigurace:</strong> {selected.konfigurace}</p>
          <p><strong>Stav:</strong> {selected.stav}</p>
          <div className="mt-2 space-x-2">
            <button onClick={() => sendAIEmail(selected)} className="bg-green-500 text-white px-2 py-1 text-sm rounded">
              🧠 Navrhni odpověď
            </button>
            <button onClick={() => alert('Email by byl odeslán zde')} className="bg-blue-500 text-white px-2 py-1 text-sm rounded">
              ✉️ Odeslat e-mail
            </button>
          </div>
          {loading && <p className="mt-2 text-sm">🔄 Generuji AI odpověď…</p>}
          {aiText && <div className="mt-2 p-2 bg-white border rounded text-sm">{aiText}</div>}
        </div>
      )}

      <table className="w-full text-sm border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Datum</th>
            <th className="border px-2 py-1">Jméno</th>
            <th className="border px-2 py-1">E-mail</th>
            <th className="border px-2 py-1">Stav</th>
            <th className="border px-2 py-1">Akce</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={i} className="border-t">
              <td className="border px-2 py-1">{p.datum}</td>
              <td className="border px-2 py-1">{p.jmeno}</td>
              <td className="border px-2 py-1">{p.email}</td>
              <td className="border px-2 py-1">
                <select
                  value={p.stav}
                  onChange={e => changeStav(i, e.target.value)}
                  className="border px-1 py-0.5 text-xs"
                >
                  <option>Nová</option>
                  <option>Řešeno</option>
                  <option>Hotovo</option>
                </select>
              </td>
              <td className="border px-2 py-1 space-x-1">
                <button onClick={() => setSelected(p)} className="bg-gray-600 text-white px-2 py-1 text-xs rounded">
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
