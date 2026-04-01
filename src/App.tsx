import { EmptyState } from './components/EmptyState'

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <EmptyState isDragging={false} onFile={() => {}} />
    </div>
  )
}
