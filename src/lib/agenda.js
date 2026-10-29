// Monta o que fazer numa data a partir do plano (src/data/plano.js).
import { COMODOS, DIAS, ROTINA_DIARIA } from '../data/plano'
import { deslocar, diaDaSemana, semanaDoMes } from './datas'

export const diaDoPlano = (iso) => DIAS.find((d) => d.numero === diaDaSemana(iso)) ?? null

// Data de um dia do plano na semana que começa em `segunda`.
export const dataDoDia = (segunda, dia) => deslocar(segunda, dia.numero - 1)

const caiNaData = (tarefa, semana, mes) =>
  (!tarefa.semanas || tarefa.semanas.includes(semana)) && (!tarefa.meses || tarefa.meses.includes(mes))

// Os cômodos do dia, cada um só com as tarefas que caem naquela semana do mês (e naquele mês). `null` no fim de semana.
export function agendaDoDia(iso) {
  const dia = diaDoPlano(iso)
  if (!dia) return null
  const semana = semanaDoMes(iso)
  const mes = Number(iso.slice(5, 7))
  return {
    dia,
    rotina: ROTINA_DIARIA,
    comodos: dia.comodos.map((id) => ({
      id,
      ...COMODOS[id],
      tarefas: COMODOS[id].tarefas.filter((t) => caiNaData(t, semana, mes)),
    })),
  }
}

// Todas as tarefas do dia numa lista só, para contar o progresso.
export const tarefasDaAgenda = (agenda) => [...agenda.rotina, ...agenda.comodos.flatMap((c) => c.tarefas)]
