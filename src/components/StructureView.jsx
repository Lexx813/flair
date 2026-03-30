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

function SectionHeading({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </p>
  )
}

export default function StructureView({ structureId, unit, onBack }) {
  const { data: structure, isLoading: sLoading, error: sError } = useStructure(structureId)
  const { data: rooms, isLoading: rLoading, error: rError } = useStructureRooms(structureId)
  const { mutate: updateStructure } = useUpdateStructure(structureId)

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
        className="text-sm flex items-center gap-1 cursor-pointer transition-colors duration-150 w-fit"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← All Homes
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
          onHomeAwayChange={(mode) => updateStructure({ 'home-away-mode': mode })}
          onHeatCoolChange={(mode) => updateStructure({ 'structure-heat-cool-mode': mode })}
          onHold={handleHold}
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
