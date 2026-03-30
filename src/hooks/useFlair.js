import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/flairClient'

const STALE = 30_000 // 30 s

// ── Structures ────────────────────────────────────────────────────────────────

export function useStructures() {
  return useQuery({
    queryKey: ['structures'],
    queryFn: api.getStructures,
    staleTime: STALE,
  })
}

export function useStructure(id) {
  return useQuery({
    queryKey: ['structure', id],
    queryFn: () => api.getStructure(id),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useUpdateStructure(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attributes) => api.updateStructure(id, attributes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['structure', id] }),
  })
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export function useStructureRooms(structureId) {
  return useQuery({
    queryKey: ['structure', structureId, 'rooms'],
    queryFn: () => api.getStructureRooms(structureId),
    enabled: !!structureId,
    staleTime: STALE,
  })
}

export function useUpdateRoom(roomId, structureId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attributes) => api.updateRoom(roomId, attributes),
    onMutate: async (attributes) => {
      await qc.cancelQueries({ queryKey: ['structure', structureId, 'rooms'] })
      const previous = qc.getQueryData(['structure', structureId, 'rooms'])
      qc.setQueryData(['structure', structureId, 'rooms'], (old) =>
        old?.map(r => r.id === roomId ? { ...r, attributes: { ...r.attributes, ...attributes } } : r)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['structure', structureId, 'rooms'], context.previous)
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['structure', structureId, 'rooms'] }),
  })
}

// ── Pucks ─────────────────────────────────────────────────────────────────────

export function useRoomPucks(roomId) {
  return useQuery({
    queryKey: ['room', roomId, 'pucks'],
    queryFn: () => api.getRoomPucks(roomId),
    enabled: !!roomId,
    staleTime: STALE,
  })
}

// ── Puck 2s ───────────────────────────────────────────────────────────────────

export function useStructurePuck2s(structureId) {
  return useQuery({
    queryKey: ['structure', structureId, 'puck2s'],
    queryFn: () => api.getStructurePuck2s(structureId),
    enabled: !!structureId,
    staleTime: STALE,
  })
}

export function useRoomPuck2s(roomId) {
  return useQuery({
    queryKey: ['room', roomId, 'puck2s'],
    queryFn: () => api.getRoomPuck2s(roomId),
    enabled: !!roomId,
    staleTime: STALE,
  })
}

export function usePuck2HvacUnits(puck2Id) {
  return useQuery({
    queryKey: ['puck2', puck2Id, 'hvac-units'],
    queryFn: () => api.getPuck2HvacUnits(puck2Id),
    enabled: !!puck2Id,
    staleTime: STALE,
  })
}

export function useUpdateHvacUnit(hvacUnitId, puck2Id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attributes) => api.updateHvacUnit(hvacUnitId, attributes),
    onMutate: async (attributes) => {
      await qc.cancelQueries({ queryKey: ['puck2', puck2Id, 'hvac-units'] })
      const previous = qc.getQueryData(['puck2', puck2Id, 'hvac-units'])
      qc.setQueryData(['puck2', puck2Id, 'hvac-units'], (old) =>
        old?.map(u => u.id === hvacUnitId ? { ...u, attributes: { ...u.attributes, ...attributes } } : u)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['puck2', puck2Id, 'hvac-units'], context.previous)
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['puck2', puck2Id, 'hvac-units'] }),
  })
}

// ── Vents ─────────────────────────────────────────────────────────────────────

export function useRoomVents(roomId) {
  return useQuery({
    queryKey: ['room', roomId, 'vents'],
    queryFn: () => api.getRoomVents(roomId),
    enabled: !!roomId,
    staleTime: STALE,
  })
}

export function useUpdateVent(ventId, roomId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attributes) => api.updateVent(ventId, attributes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['room', roomId, 'vents'] }),
  })
}
