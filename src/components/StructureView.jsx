import { useStructure, useStructureRooms, useUpdateStructure } from '../hooks/useFlair'
import StructureHeader from './StructureHeader'
import RoomCard from './RoomCard'
import Spinner from './Spinner'

export default function StructureView({ structureId, unit, onBack }) {
  const { data: structure, isLoading: sLoading, error: sError } = useStructure(structureId)
  const { data: rooms, isLoading: rLoading, error: rError } = useStructureRooms(structureId)
  const { mutate: updateStructure } = useUpdateStructure(structureId)

  const loading = sLoading || rLoading
  const error = sError || rError

  if (loading && !structure) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="font-medium" style={{ color: 'var(--error)' }}>Failed to load</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{error?.message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="text-sm flex items-center gap-1 cursor-pointer transition-colors duration-150 w-fit"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← All Homes
      </button>

      {structure && (
        <StructureHeader
          structure={structure}
          unit={unit}
          onModeChange={(mode) => updateStructure({ mode })}
          onSetPointChange={(temp) => updateStructure({ 'set-point-temperature-c': temp })}
        />
      )}

      {rooms?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} structureId={structureId} unit={unit} />
          ))}
        </div>
      )}

      {!rooms?.length && !loading && (
        <p className="text-center py-10" style={{ color: 'var(--text-label)' }}>No rooms found.</p>
      )}
    </div>
  )
}
