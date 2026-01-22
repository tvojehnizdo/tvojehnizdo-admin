export default function Home() {
  const phases = [
    {
      name: "Zkontroluj build a oprav všechny chyby",
      description: "Proveď kompletní kontrolu repozitáře, oprav chybějící importy, špatné cesty a chyby ve funkčních i vizuálních komponentech. Zajisti, že projekt běží bezchybně.",
      completed: true
    },
    {
      name: "Vyčisti repozitář",
      description: "Odstraň nepoužívané komponenty, knihovny, komentáře, zálohované soubory a testovací zbytky. Udržuj repozitář profesionálně čistý.",
      completed: false,
      current: true
    },
    {
      name: "Zavést CI/CD",
      description: "Připrav GitHub Actions nebo Vercel hooks pro automatické nasazení při commitu na hlavní větev. Kontrola prostředí, build a nasazení.",
      completed: false
    },
    {
      name: "Zkontroluj připojení externích služeb",
      description: "Prověř napojení na Google Sheets, OpenAI API, EmailJS/SMTP, PDF generátor. Zkontroluj klíče a doplň do.",
      completed: false
    },
    {
      name: "Optimalizuj UI/UX",
      description: "Uprav rozložení, komponenty a styly podle shadcn/ui + Tailwind standardu. Zajisti responzivitu a profesionální vzhled.",
      completed: false
    },
    {
      name: "Zaveď základní ochranu",
      description: "Implementuj jednoduché přihlášení nebo hardcoded přístup pro admin panel. Chraň neautorizovaný přístup a citlivé akce.",
      completed: false
    },
    {
      name: "Zajisti ostré nasazení",
      description: "Po každé úpravě ověř, že vše funguje na Vercelu nebo cílové doméně. Otestuj zabezpečení a základní funkcionality.",
      completed: false
    }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.current);
  const completedCount = phases.filter(p => p.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tvoje Hnízdo – Admin Panel
          </h1>
          <p className="text-lg text-gray-600">
            ✅ Admin panel běží!
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            V jaké jsme fázi? Co se teď děje?
          </h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Postup projektu
              </span>
              <span className="text-sm font-medium text-gray-600">
                {completedCount} / {phases.length} fází dokončeno
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / phases.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {currentPhaseIndex >= 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm font-medium text-blue-800 mb-1">
                🔵 AKTUÁLNÍ FÁZE ({currentPhaseIndex + 1}/{phases.length})
              </p>
              <p className="text-lg font-semibold text-blue-900">
                {phases[currentPhaseIndex].name}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div 
              key={index}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                phase.completed 
                  ? 'border-green-500 bg-green-50' 
                  : phase.current 
                    ? 'border-blue-500' 
                    : 'border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {phase.completed ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-lg">✓</span>
                    </div>
                  ) : phase.current ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-lg">▶</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    phase.completed ? 'text-green-900' : phase.current ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    {phase.name}
                  </h3>
                  <p className={`text-sm ${
                    phase.completed ? 'text-green-700' : phase.current ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {phase.description}
                  </p>
                  {phase.completed && (
                    <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                      DOKONČENO
                    </span>
                  )}
                  {phase.current && (
                    <span className="inline-block mt-2 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      PROBÍHÁ
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
