import { TodosPage } from "./TodosPage"
import { useTodos } from "./useTodos"

export default function TodosRoute() {
  const vm = useTodos()
  return <TodosPage {...vm} />
}
