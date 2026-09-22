import { Route, Routes } from "react-router-dom"
import HomeRoute from "./pages/Home/index.tsx"
import CoursesRoute from "./pages/Courses/index.tsx"
import TodosRoute from "./pages/Todos/index.tsx"
import { SwipeNav } from "./components/layout/SwipeNav"
import SettingsRoute from "./pages/Settings/index.tsx"

function App() {
  return (
    <SwipeNav>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/courses" element={<CoursesRoute />} />
        <Route path="/todos" element={<TodosRoute />} />
        <Route path="/settings" element={<SettingsRoute />} />
        <Route path="*" element={<HomeRoute />} />
      </Routes>
    </SwipeNav>
  )
}

export default App
