import Feed from "../components/Feed";
import Sidebar from "../components/Sidebar";

export default function Wall() {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-8 max-w-screen min-h-screen mx-auto">
      <Sidebar />
      <Feed />
    </div>
  )
}
