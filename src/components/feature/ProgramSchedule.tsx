import { useState } from 'react';

interface Program {
  id: number;
  time: string;
  title: string;
  dj: string;
  description: string;
  isLive?: boolean;
}

export default function ProgramSchedule() {
  const [selectedDay, setSelectedDay] = useState('hoje');

  const programs: Program[] = [
    {
      id: 1,
      time: '06:00',
      title: 'Roots Morning',
      dj: 'DJ Marley',
      description: 'Comece o dia com reggae clássico',
      isLive: false
    },
    {
      id: 2,
      time: '09:00',
      title: 'Reggae Vibes',
      dj: 'DJ Rasta',
      description: 'Os melhores hits reggae',
      isLive: false
    },
    {
      id: 3,
      time: '14:00',
      title: 'Live Session',
      dj: 'DJ Echo',
      description: 'Transmissão ao vivo com interação',
      isLive: true
    },
    {
      id: 4,
      time: '18:00',
      title: 'Sunset Reggae',
      dj: 'DJ Marley',
      description: 'Reggae para o fim de tarde',
      isLive: false
    },
    {
      id: 5,
      time: '21:00',
      title: 'Night Vibes',
      dj: 'DJ Rasta',
      description: 'Reggae roots para a noite',
      isLive: false
    },
    {
      id: 6,
      time: '00:00',
      title: 'Midnight Dub',
      dj: 'DJ Echo',
      description: 'Dub e reggae instrumental',
      isLive: false
    }
  ];

  const days = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'amanha', label: 'Amanhã' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-green-800">Programação Semanal</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 font-medium">Ao Vivo</span>
        </div>
      </div>

      {/* Seletor de Dia */}
      <div className="flex space-x-2 mb-6">
        {days.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedDay === day.key
                ? 'bg-gradient-to-r from-green-600 to-yellow-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Lista de Programas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              program.isLive
                ? 'bg-green-50 border-green-300 shadow-sm'
                : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-bold text-green-700">{program.time}</span>
                  {program.isLive && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-semibold">
                      AO VIVO
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-1">{program.title}</h4>
                <p className="text-sm text-gray-600 mb-1 font-medium">{program.dj}</p>
                <p className="text-sm text-gray-500">{program.description}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                <i className={`ri-${program.isLive ? 'live' : 'music-2'}-line text-green-600 text-lg`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <i className="ri-information-line text-green-600"></i>
          <p className="text-sm">
            Programação sujeita a alterações • Transmissão 24/7
          </p>
        </div>
      </div>
    </div>
  );
}