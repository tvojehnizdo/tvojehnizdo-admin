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
}

export default function PoptavkyPage() {
  const [poptavky, setPoptavky] = useState<Poptavka[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/poptavky');
        const data = await res.json();
        setPoptavky(data);
      } catch (err) {
        console.error('Chyba při načítání:', err);
      }
    }
    fetchData();
  }, []);

  const filtered = poptavky.filter(p =>
    `${p.jmeno} ${p.email} ${p.poznamka} ${p.konfigurace}`.toLowerCase().includes(search.toLowerCase())
  );

  const sendEmail = (p: Poptavka) => {
    emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: p.email,
        user_name: p.jmeno,
        message: `Děkujeme za zájem! Vaše konfigurace: ${p.konfigurace}`,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    ).then(() => alert('Email odeslán ✅')).catch(err => alert('Chyba při odesílání ❌'));
  };

  const summarize = async (p: Poptavka) => {
    setLoading(true);
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Jsi AI asistent pro shrnutí poptávky.' },
        { role: 'user', content: `Shrň následující poptávku: ${p.poznamka}` },
      ],
      model: 'gpt-4',
    });
    setAiResult(response.choices[0].message.content || 'Nelze shrnout.');
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Poptávky</h1>
      <input
        type="text"
        placeholder="Hledat jméno, email, poznámku..."
        className="border px-2 py-1 mb-4 w-full"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {loading && <p className="mb-4">🔄 Načítám AI sumarizaci...</p>}
      {aiResult && <div className="bg-green-100 p-3 rounded mb-4">{aiResult}</div>}
      <table className="w-full text-sm border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Datum</th>
            <th className="border px-2 py-1">Jméno</th>
            <th className="border px-2 py-1">E-mail</th>
            <th className="border px-2 py-1">Poznámka</th>
            <th className="border px-2 py-1">Akce</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={i} className="border-t">
              <td className="border px-2 py-1">{p.datum}</td>
              <td className="border px-2 py-1">{p.jmeno}</td>
              <td className="border px-2 py-1">{p.email}</td>
              <td className="border px-2 py-1">{p.poznamka}</td>
              <td className="border px-2 py-1 space-x-2">
                <button onClick={() => sendEmail(p)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                  Odeslat email
                </button>
                <button onClick={() => summarize(p)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                  AI Shrnutí
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
