import { Outlet } from 'react-router-dom'

export default function PenulisLayout() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Layout DKM</h2>
      <Outlet />
    </div>
  )
}
