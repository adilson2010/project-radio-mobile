import { useState, useEffect } from 'react';

interface Program {
  id: number;
  time: string;
  title: string;
  dj: string;
  description: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export default function ProgramSchedule() {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário atual a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setSelectedDay(now.getDay());
    }, 60000); // Atualiza a cada 1 minuto

    return () => clearInterval(timer);
  }, []);

  // Programação completa da semana
  const allPrograms: Program[] = [
    // Domingo (0)
    { id: 1, dayOfWeek: 0, time: '06:00', startHour: 6, startMinute: 0, endHour: 9, endMinute: 0, title: 'Roots Morning', dj: 'DJ Auto', description: 'Comece o dia com reggae clássico' },
    { id: 2, dayOfWeek: 0, time: '09:00', startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, title: 'Reggae Vibes', dj: 'DJ Auto', description: 'Os melhores hits reggae' },
    { id: 3, dayOfWeek: 0, time: '14:00', startHour: 14, startMinute: 0, endHour: 18, endMinute: 0, title: 'Live Session', dj: 'DJ Auto', description: 'Transmissão ao vivo com interação' },
    { id: 4, dayOfWeek: 0, time: '18:00', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, title: 'Sunset Reggae', dj: 'DJ Auto', description: 'Reggae para o fim de tarde' },
    { id: 5, dayOfWeek: 0, time: '21:00', startHour: 21, startMinute: 0, endHour: 0, endMinute: 0, title: 'Night Vibes', dj: 'DJ Auto', description: 'Reggae roots para a noite' },
    { id: 6, dayOfWeek: 0, time: '00:00', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, title: 'Midnight Dub', dj: 'DJ Auto', description: 'Dub e reggae instrumental' },
    
    // Segunda-feira (1)
    { id: 7, dayOfWeek: 1, time: '06:00', startHour: 6, startMinute: 0, endHour: 9, endMinute: 0, title: 'Morning Roots', dj: 'DJ Auto', description: 'Energia reggae para começar a semana' },
    { id: 8, dayOfWeek: 1, time: '09:00', startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, title: 'Reggae Classics', dj: 'DJ Auto', description: 'Clássicos do reggae mundial' },
    { id: 9, dayOfWeek: 1, time: '14:00', startHour: 14, startMinute: 0, endHour: 18, endMinute: 0, title: 'Afternoon Vibes', dj: 'DJ Auto', description: 'Reggae para a tarde' },
    { id: 10, dayOfWeek: 1, time: '18:00', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, title: 'Evening Session', dj: 'DJ Auto', description: 'Reggae ao vivo' },
    { id: 11, dayOfWeek: 1, time: '21:00', startHour: 21, startMinute: 0, endHour: 0, endMinute: 0, title: 'Night Roots', dj: 'DJ Auto', description: 'Roots reggae para a noite' },
    { id: 12, dayOfWeek: 1, time: '00:00', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, title: 'Late Night Dub', dj: 'DJ Auto', description: 'Dub e instrumental' },
    
    // Terça-feira (2)
    { id: 13, dayOfWeek: 2, time: '06:00', startHour: 6, startMinute: 0, endHour: 9, endMinute: 0, title: 'Roots Morning', dj: 'DJ Auto', description: 'Reggae matinal' },
    { id: 14, dayOfWeek: 2, time: '09:00', startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, title: 'Reggae Power', dj: 'DJ Auto', description: 'Energia reggae' },
    { id: 15, dayOfWeek: 2, time: '14:00', startHour: 14, startMinute: 0, endHour: 18, endMinute: 0, title: 'Live Afternoon', dj: 'DJ Auto', description: 'Transmissão ao vivo' },
    { id: 16, dayOfWeek: 2, time: '18:00', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, title: 'Sunset Roots', dj: 'DJ Auto', description: 'Reggae roots' },
    { id: 17, dayOfWeek: 2, time: '21:00', startHour: 21, startMinute: 0, endHour: 0, endMinute: 0, title: 'Night Session', dj: 'DJ Auto', description: 'Sessão noturna' },
    { id: 18, dayOfWeek: 2, time: '00:00', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, title: 'Midnight Reggae', dj: 'DJ Auto', description: 'Reggae da madrugada' },
    
    // Quarta-feira (3)
    { id: 19, dayOfWeek: 3, time: '06:00', startHour: 6, startMinute: 0, endHour: 9, endMinute: 0, title: 'Morning Vibes', dj: 'DJ Auto', description: 'Vibes matinais' },
    { id: 20, dayOfWeek: 3, time: '09:00', startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, title: 'Reggae Mix', dj: 'DJ Auto', description: 'Mix de reggae' },
    { id: 21, dayOfWeek: 3, time: '14:00', startHour: 14, startMinute: 0, endHour: 18, endMinute: 0, title: 'Live Mix', dj: 'DJ Auto', description: 'Mix ao vivo' },
    { id: 22, dayOfWeek: 3, time: '18:00', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, title: 'Evening Roots', dj: 'DJ Auto', description: 'Roots da noite' },
    { id: 23, dayOfWeek: 3, time: '21:00', startHour: 21, startMinute: 0, endHour: 0, endMinute: 0, title: 'Night Classics', dj: 'DJ Auto', description: 'Clássicos noturnos' },
    { id: 24, dayOfWeek: 3, time: '00:00', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, title: 'Late Dub', dj: 'DJ Auto', description: 'Dub tardio' },
    
    // Quinta-feira (4)
    { id: 25, dayOfWeek: 4, time: '06:00', startHour: 6, startMinute: 0, endHour: 9, endMinute: 0, title: 'Roots Wake Up', dj: 'DJ Auto', description: 'Acorde com reggae' },
    { id: 26, dayOfWeek: 4, time: '09:00', startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, title: 'Reggae Hits', dj: 'DJ Auto', description: 'Sucessos do reggae' },
    { id: 27, dayOfWeek: 4, time: '14:00', startHour: 14, startMinute: 0, endHour: 18, endMinute: 0, title: 'Live Hits', dj: 'DJ Auto', description: 'Hits ao vivo' },
    { id: 28, dayOfWeek: 4, time: '18:00', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, title: 'Sunset Session', dj: 'DJ Auto', description: 'Sessão do pôr do sol' },
    { id: 29, dayOfWeek: 4, time: '21:00', startHour: 21, startMinute: 0, endHour: 0, endMinute: 0, title: 'Night Reggae', dj: 'DJ Auto', description: 'Reggae noturno' },
    { id: 30, dayOfWeek: 4, time: '00:00', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, title: 'Midnight Vibes', dj: 'DJ Auto', description: 'Vibes da meia-noite' },
    
    // Sexta-feira (5)
    { id: 31, dayOfWeek: 5, time: '06:00', startHour: 6, startMinute: 0, endHour: 9, endMinute: 0, title: 'Friday Morning', dj: 'DJ Auto', description: 'Sexta-feira reggae' },
    { id: 32, dayOfWeek: 5, time: '09:00', startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, title: 'Reggae Party', dj: 'DJ Auto', description: 'Festa reggae' },
    { id: 33, dayOfWeek: 5, time: '14:00', startHour: 14, startMinute: 0, endHour: 18, endMinute: 0, title: 'Live Party', dj: 'DJ Auto', description: 'Festa ao vivo' },
    { id: 34, dayOfWeek: 5, time: '18:00', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, title: 'Friday Night', dj: 'DJ Auto', description: 'Noite de sexta' },
    { id: 35, dayOfWeek: 5, time: '21:00', startHour: 21, startMinute: 0, endHour: 0, endMinute: 0, title: 'Night Party', dj: 'DJ Auto', description: 'Festa da noite' },
    { id: 36, dayOfWeek: 5, time: '00:00', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, title: 'Late Night Party', dj: 'DJ Auto', description: 'Festa madrugada' },
    
    // Sábado (6)
    { id: 37, dayOfWeek: 6, time: '06:00', startHour: 6, startMinute: 0, endHour: 9, endMinute: 0, title: 'Saturday Morning', dj: 'DJ Auto', description: 'Manhã de sábado' },
    { id: 38, dayOfWeek: 6, time: '09:00', startHour: 9, startMinute: 0, endHour: 14, endMinute: 0, title: 'Weekend Vibes', dj: 'DJ Auto', description: 'Vibes de fim de semana' },
    { id: 39, dayOfWeek: 6, time: '14:00', startHour: 14, startMinute: 0, endHour: 18, endMinute: 0, title: 'Live Weekend', dj: 'DJ Auto', description: 'Fim de semana ao vivo' },
    { id: 40, dayOfWeek: 6, time: '18:00', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, title: 'Saturday Night', dj: 'DJ Auto', description: 'Noite de sábado' },
    { id: 41, dayOfWeek: 6, time: '21:00', startHour: 21, startMinute: 0, endHour: 0, endMinute: 0, title: 'Night Special', dj: 'DJ Auto', description: 'Especial noturno' },
    { id: 42, dayOfWeek: 6, time: '00:00', startHour: 0, startMinute: 0, endHour: 6, endMinute: 0, title: 'Midnight Special', dj: 'DJ Auto', description: 'Especial da meia-noite' }
  ];

  // Verificar se um programa está ao vivo agora
  const isProgramLive = (program: Program): boolean => {
    const now = currentTime;
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Verificar se é o mesmo dia da semana
    if (program.dayOfWeek !== currentDay) {
      return false;
    }

    // Calcular minutos totais do programa
    let startTotalMinutes = program.startHour * 60 + program.startMinute;
    let endTotalMinutes = program.endHour * 60 + program.endMinute;

    // Se o programa termina à meia-noite (00:00), considerar como 24:00 (1440 minutos)
    if (program.endHour === 0 && program.endMinute === 0) {
      endTotalMinutes = 24 * 60;
    }

    // Verificar se o horário atual está dentro do intervalo do programa
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
  };

  // Filtrar programas do dia selecionado
  const programs = allPrograms.filter(p => p.dayOfWeek === selectedDay);

  // Encontrar programa ao vivo
  const liveProgram = allPrograms.find(p => isProgramLive(p));

  const days = [
    { key: 0, label: 'Domingo' },
    { key: 1, label: 'Segunda' },
    { key: 2, label: 'Terça' },
    { key: 3, label: 'Quarta' },
    { key: 4, label: 'Quinta' },
    { key: 5, label: 'Sexta' },
    { key: 6, label: 'Sábado' }
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

      {/* Programa Ao Vivo Agora */}
      {liveProgram && (
        <div className="mb-6 bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white text-green-700 text-xs px-3 py-1 rounded-full animate-pulse font-bold">
                  🔴 AO VIVO AGORA
                </span>
                <span className="text-lg font-bold">{liveProgram.time}</span>
              </div>
              <h4 className="font-bold text-xl mb-1">{liveProgram.title}</h4>
              <p className="text-sm font-medium mb-1">{liveProgram.dj}</p>
              <p className="text-sm opacity-90">{liveProgram.description}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
              <i className="ri-live-line text-2xl"></i>
            </div>
          </div>
        </div>
      )}

      {/* Seletor de Dia */}
      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
        {days.map((day) => {
          const isToday = day.key === new Date().getDay();
          const isSelected = selectedDay === day.key;
          
          return (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-green-600 to-yellow-500 text-white shadow-md'
                  : isToday
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50'
              }`}
            >
              {day.label}
              {isToday && <span className="ml-1 text-xs">• Hoje</span>}
            </button>
          );
        })}
      </div>

      {/* Lista de Programas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => {
          const isLive = isProgramLive(program);
          
          return (
            <div
              key={program.id}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                isLive
                  ? 'bg-green-50 border-green-400 shadow-md ring-2 ring-green-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-lg font-bold ${isLive ? 'text-green-700' : 'text-green-700'}`}>
                      {program.time}
                    </span>
                    {isLive && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-semibold">
                        AO VIVO
                      </span>
                    )}
                  </div>
                  <h4 className={`font-bold text-base mb-1 ${isLive ? 'text-green-800' : 'text-gray-800'}`}>
                    {program.title}
                  </h4>
                  <p className={`text-sm mb-1 font-medium ${isLive ? 'text-green-700' : 'text-gray-600'}`}>
                    {program.dj}
                  </p>
                  <p className="text-sm text-gray-500">{program.description}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ml-3 flex-shrink-0 ${
                  isLive 
                    ? 'bg-gradient-to-br from-green-400 to-yellow-400' 
                    : 'bg-gradient-to-br from-green-100 to-yellow-100'
                }`}>
                  <i className={`ri-${isLive ? 'live' : 'music-2'}-line text-green-600 text-lg`}></i>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <i className="ri-information-line text-green-600"></i>
          <p className="text-sm">
            Programação atualizada em tempo real • Transmissão Online 24h
          </p>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">
            Horário atual: {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {days[currentTime.getDay()].label}
          </p>
        </div>
      </div>
    </div>
  );
}
