import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useStructure, useStructureRooms, useUpdateStructure,
  useStructureWeather, useStructureSchedules,
  useStructureThermostats, useStructureRemoteSensors, useStructureAlerts,
} from '../hooks/useFlair'
import StructureHeader from './StructureHeader'
import RoomCard from './RoomCard'
import ThermostatCard from './ThermostatCard'
import RemoteSensorList from './RemoteSensorList'
import AlertList from './AlertList'
import ScheduleList from './ScheduleList'
import Spinner from './Spinner'

function SortableRoomCard({ room, structureId, unit }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: room.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : undefined,
      }}
    >
      <RoomCard
        room={room}
        structureId={structureId}
        unit={unit}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </p>
  )
}

const STORAGE_KEY = id => `flair-room-order-${id}`

export default function StructureView({ structureId, unit, onBack }) {
  const { data: structure, isLoading: sLoading, error: sError } = useStructure(structureId)
  const { data: rooms, isLoading: rLoading, error: rError } = useStructureRooms(structureId)
  const { mutate: updateStructure } = useUpdateStructure(structureId)

  const [orderedIds, setOrderedIds] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)

  // Sync order when rooms load: preserve saved order, append any new rooms
  useEffect(() => {
    if (!rooms) return
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY(structureId))) ?? [] } catch { return [] }
    })()
    const allIds = rooms.map(r => r.id)
    const merged = [
      ...saved.filter(id => allIds.includes(id)),
      ...allIds.filter(id => !saved.includes(id)),
    ]
    setOrderedIds(merged)
  }, [rooms, structureId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragStart({ active }) {
    setActiveRoom(rooms?.find(r => r.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }) {
    setActiveRoom(null)
    if (!over || active.id === over.id) return
    setOrderedIds(prev => {
      const next = arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id))
      localStorage.setItem(STORAGE_KEY(structureId), JSON.stringify(next))
      return next
    })
  }

  const { data: weather }   = useStructureWeather(structureId)
  const { data: schedules } = useStructureSchedules(structureId)
  const { data: thermostats }   = useStructureThermostats(structureId)
  const { data: remoteSensors } = useStructureRemoteSensors(structureId)
  const { data: alerts }        = useStructureAlerts(structureId)

  const loading = sLoading || rLoading
  const error = sError || rError

  function handleHold(option) {
    if (option === 'clear') {
      updateStructure({ 'hold-until': null })
      return
    }
    const now = new Date()
    let holdUntil
    if (option === '1h')      holdUntil = new Date(now.getTime() + 1 * 60 * 60 * 1000)
    else if (option === '2h') holdUntil = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    else if (option === '4h') holdUntil = new Date(now.getTime() + 4 * 60 * 60 * 1000)
    else if (option === 'tonight') {
      holdUntil = new Date(now)
      holdUntil.setHours(23, 59, 0, 0)
    }
    if (holdUntil) updateStructure({ 'hold-until': holdUntil.toISOString() })
  }

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

  const activeAlerts = alerts?.filter(a => a.attributes['is-active'] !== false) ?? []

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer
          transition-all duration-150 min-h-[44px] px-2 -mx-2 rounded-xl active:scale-95"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={15} />
        All Homes
      </button>

      {activeAlerts.length > 0 && <AlertList alerts={activeAlerts} />}

      {structure && (
        <StructureHeader
          structure={structure}
          unit={unit}
          weather={weather}
          schedules={schedules}
          onModeChange={(mode) => updateStructure({ mode })}
          onSetPointChange={(temp) => updateStructure({ 'set-point-temperature-c': temp })}
onHeatCoolChange={(mode) => updateStructure({ 'structure-heat-cool-mode': mode })}
          onHold={handleHold}
        />
      )}

      {rLoading && !rooms ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-3xl px-6 py-6 flex flex-col gap-4 animate-pulse"
              style={{ background: 'var(--card-gradient)', border: '1px solid var(--border-subtle)', minHeight: 160 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="h-2.5 w-16 rounded-full" style={{ background: 'var(--bg-surface-2)' }} />
                  <div className="h-5 w-12 rounded-full" style={{ background: 'var(--bg-surface-2)' }} />
                </div>
                <div className="h-10 w-16 rounded-2xl" style={{ background: 'var(--bg-surface-2)' }} />
              </div>
              <div className="h-px" style={{ background: 'var(--divider)' }} />
              <div className="flex justify-between items-center">
                <div className="h-7 w-14 rounded-full" style={{ background: 'var(--bg-surface-2)' }} />
                <div className="flex gap-2">
                  <div className="w-9 h-9 rounded-full" style={{ background: 'var(--bg-surface-2)' }} />
                  <div className="w-9 h-9 rounded-full" style={{ background: 'var(--bg-surface-2)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rooms?.length > 0 && orderedIds.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderedIds.map(id => {
                const room = rooms.find(r => r.id === id)
                if (!room) return null
                return (
                  <SortableRoomCard key={id} room={room} structureId={structureId} unit={unit} />
                )
              })}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
            {activeRoom && (
              <div style={{ opacity: 0.9, transform: 'scale(1.02)', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.35))' }}>
                <RoomCard room={activeRoom} structureId={structureId} unit={unit} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : !rLoading && (
        <div className="text-center py-12 flex flex-col items-center gap-2">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No rooms found</p>
          <p className="text-xs" style={{ color: 'var(--text-label)' }}>Add rooms in the Flair app to see them here.</p>
        </div>
      )}

      {thermostats?.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeading>Thermostats</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {thermostats.map(t => (
              <ThermostatCard key={t.id} thermostat={t} structureId={structureId} unit={unit} />
            ))}
          </div>
        </div>
      )}

      {remoteSensors?.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeading>Remote Sensors</SectionHeading>
          <RemoteSensorList sensors={remoteSensors} unit={unit} />
        </div>
      )}

      {schedules?.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeading>Schedules</SectionHeading>
          <ScheduleList schedules={schedules} unit={unit} />
        </div>
      )}
    </div>
  )
}
