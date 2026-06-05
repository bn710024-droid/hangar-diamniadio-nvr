'use client'
// lib/store.js — État global partagé via localStorage
import { useState, useEffect, useCallback } from 'react'
import { CAMERAS } from './data'

const STORAGE_KEYS = {
  cameras: 'dabakh_cameras',
  incidents: 'dabakh_incidents',
  maints: 'dabakh_maints',
}

function load(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function useCameras() {
  const [cameras, setCamerasRaw] = useState(CAMERAS)
  useEffect(() => {
    const stored = load(STORAGE_KEYS.cameras, null)
    if (stored) setCamerasRaw(stored)
  }, [])
  const setCameras = useCallback((val) => {
    setCamerasRaw(val)
    save(STORAGE_KEYS.cameras, val)
    window.dispatchEvent(new Event('dabakh_cameras_changed'))
  }, [])
  useEffect(() => {
    const handler = () => {
      const stored = load(STORAGE_KEYS.cameras, CAMERAS)
      setCamerasRaw(stored)
    }
    window.addEventListener('dabakh_cameras_changed', handler)
    return () => window.removeEventListener('dabakh_cameras_changed', handler)
  }, [])
  return [cameras, setCameras]
}

export function useIncidents() {
  const [incidents, setIncidentsRaw] = useState([])
  useEffect(() => {
    const stored = load(STORAGE_KEYS.incidents, [])
    setIncidentsRaw(stored)
  }, [])
  const setIncidents = useCallback((val) => {
    setIncidentsRaw(val)
    save(STORAGE_KEYS.incidents, val)
    window.dispatchEvent(new Event('dabakh_incidents_changed'))
  }, [])
  useEffect(() => {
    const handler = () => {
      const stored = load(STORAGE_KEYS.incidents, [])
      setIncidentsRaw(stored)
    }
    window.addEventListener('dabakh_incidents_changed', handler)
    return () => window.removeEventListener('dabakh_incidents_changed', handler)
  }, [])
  return [incidents, setIncidents]
}

export function useMaints() {
  const [maints, setMaintsRaw] = useState([])
  useEffect(() => {
    const stored = load(STORAGE_KEYS.maints, [])
    setMaintsRaw(stored)
  }, [])
  const setMaints = useCallback((val) => {
    setMaintsRaw(val)
    save(STORAGE_KEYS.maints, val)
    window.dispatchEvent(new Event('dabakh_maints_changed'))
  }, [])
  useEffect(() => {
    const handler = () => {
      const stored = load(STORAGE_KEYS.maints, [])
      setMaintsRaw(stored)
    }
    window.addEventListener('dabakh_maints_changed', handler)
    return () => window.removeEventListener('dabakh_maints_changed', handler)
  }, [])
  return [maints, setMaints]
}

export function resetCameras() {
  save(STORAGE_KEYS.cameras, CAMERAS)
  window.dispatchEvent(new Event('dabakh_cameras_changed'))
}
