'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'

export default function AppShell({ children, hsCnt = 0, onRefresh, refreshing }) {
  const [sideOpen, setSideOpen] = useState(false)
  return (
    <div className="app">
      <Sidebar hsCnt={hsCnt} sideOpen={sideOpen} closeSide={() => setSideOpen(false)} />
      <main className="main">
        <Topbar openSide={() => setSideOpen(true)} onRefresh={onRefresh} refreshing={refreshing} />
        {children}
      </main>
      <BottomNav hsCnt={hsCnt} />
    </div>
  )
}
