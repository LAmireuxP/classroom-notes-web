import { CoursesPage } from "./CoursesPage"
import { useCourses } from "./useCourses"

export default function CoursesRoute() {
  const vm = useCourses()
  return <CoursesPage {...vm} />
}
