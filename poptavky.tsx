import { GoogleSpreadsheet } from 'google-spreadsheet';
import { useEffect, useState } from 'react';

interface Poptavka {
  datum: string;
  jmeno: string;
  email: string;
  poznamka: string;
  konfigurace: string;
}

export default function PoptavkyPage() {
  const [poptavky, setPoptavky] = useState<Poptavka[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const doc = new GoogleSpreadsheet(process.env.NEXT_PUBLIC_SHEET_ID!);
        await doc.useServiceAccountAuth({
          client_email: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL!,
          private_key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        });
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['poptavky'];
        const rows = await sheet.getRows();

        const parsed = rows.map((row: any) => ({
          datum: row.datum || '',
          jmeno: row.jmeno || '',
          email: row.email || '',
          poznamka: row.poznamka || '',
          konfigurace: row.konfigurace || '',
        }));

        setPoptavky(parsed);
      } catch (err) {
        console.error('Chyba při načítání:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Seznam poptávek</h1>
      {loading ? (
        <p>Načítám...</p>
      ) : (
        <table className="w-full text-sm border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Datum</th>
              <th className="border px-2 py-1">Jméno</th>
              <th className="border px-2 py-1">E-mail</th>
              <th className="border px-2 py-1">Poznámka</th>
              <th className="border px-2 py-1">Konfigurace</th>
            </tr>
          </thead>
          <tbody>
            {poptavky.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="border px-2 py-1">{p.datum}</td>
                <td className="border px-2 py-1">{p.jmeno}</td>
                <td className="border px-2 py-1">{p.email}</td>
                <td className="border px-2 py-1">{p.poznamka}</td>
                <td className="border px-2 py-1">{p.konfigurace}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
