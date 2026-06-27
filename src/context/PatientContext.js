import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { PHOTO_SLOTS } from '../data';

async function saveToPatientAlbum(uri, albumName) {
  try {
    const perm = await MediaLibrary.getPermissionsAsync(true);
    if (!perm.granted) {
      const req = await MediaLibrary.requestPermissionsAsync(true);
      if (!req.granted) return { ok: false, reason: 'denied' };
    }
    const asset = await MediaLibrary.createAssetAsync(uri);
    const safeName = (albumName || 'Pictures').trim() || 'Pictures';
    let album = await MediaLibrary.getAlbumAsync(safeName);
    if (!album) {
      album = await MediaLibrary.createAlbumAsync(safeName, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || 'unknown' };
  }
}

const STORAGE_KEY = '@oralcollect.patients.v1';
const PHOTO_DIR = FileSystem.documentDirectory + 'oralcollect/';

const PatientContext = createContext(null);

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
}

export function PatientProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureDir();
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPatients(JSON.parse(raw));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setPatients(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addPatient = useCallback(
    async (data) => {
      const patient = {
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: data.name?.trim() || 'Unnamed',
        age: data.age?.toString() || '',
        sex: data.sex || '',
        complaints: data.complaints?.trim() || '',
        createdAt: Date.now(),
        photos: [],
      };
      await persist([patient, ...patients]);
      return patient;
    },
    [patients, persist]
  );

  const updatePatient = useCallback(
    async (id, updates) => {
      const next = patients.map((p) => (p.id === id ? { ...p, ...updates } : p));
      await persist(next);
    },
    [patients, persist]
  );

  const deletePatient = useCallback(
    async (id) => {
      const target = patients.find((p) => p.id === id);
      if (target) {
        for (const ph of target.photos || []) {
          try { await FileSystem.deleteAsync(ph.uri, { idempotent: true }); } catch (e) {}
        }
      }
      await persist(patients.filter((p) => p.id !== id));
    },
    [patients, persist]
  );

  const setPhoto = useCallback(
    async (patientId, slotId, srcUri) => {
      await ensureDir();
      const filename = `${patientId}_${slotId}_${Date.now()}.jpg`;
      const dest = PHOTO_DIR + filename;
      await FileSystem.copyAsync({ from: srcUri, to: dest });

      const patient = patients.find((p) => p.id === patientId);
      const existing = (patient?.photos || []).find((ph) => ph.slotId === slotId);
      if (existing) {
        try { await FileSystem.deleteAsync(existing.uri, { idempotent: true }); } catch (e) {}
      }

      const photo = {
        id: 'ph_' + Date.now(),
        slotId,
        uri: dest,
        capturedAt: Date.now(),
        exported: false,
      };

      const next = patients.map((p) => {
        if (p.id !== patientId) return p;
        const others = (p.photos || []).filter((ph) => ph.slotId !== slotId);
        return { ...p, photos: [photo, ...others] };
      });
      await persist(next);
      return photo;
    },
    [patients, persist]
  );

  const exportPatientToAlbum = useCallback(
    async (patientId) => {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) return { ok: false, reason: 'patient not found' };

      const pending = (patient.photos || []).filter((ph) => !ph.exported);
      if (pending.length === 0) return { ok: true, exported: 0, skipped: 0, total: 0 };

      const albumName = patient.name?.trim() || 'Pictures';
      let exported = 0;
      let lastError = null;

      const slotOrder = PHOTO_SLOTS.map((s) => s.id);
      const ordered = [...pending].sort(
        (a, b) => slotOrder.indexOf(a.slotId) - slotOrder.indexOf(b.slotId)
      );

      const exportedIds = new Set();
      for (const ph of ordered) {
        const r = await saveToPatientAlbum(ph.uri, albumName);
        if (r.ok) {
          exported += 1;
          exportedIds.add(ph.id);
        } else {
          lastError = r.reason;
        }
      }

      const next = patients.map((p) =>
        p.id === patientId
          ? {
              ...p,
              photos: (p.photos || []).map((ph) =>
                exportedIds.has(ph.id) ? { ...ph, exported: true, album: albumName } : ph
              ),
              lastExportedAt: exported > 0 ? Date.now() : p.lastExportedAt,
            }
          : p
      );
      await persist(next);

      return {
        ok: exported > 0 || pending.length === 0,
        exported,
        skipped: pending.length - exported,
        total: pending.length,
        albumName,
        reason: lastError,
      };
    },
    [patients, persist]
  );

  const deletePhoto = useCallback(
    async (patientId, photoId) => {
      const patient = patients.find((p) => p.id === patientId);
      const photo = patient?.photos?.find((ph) => ph.id === photoId);
      if (photo) {
        try { await FileSystem.deleteAsync(photo.uri, { idempotent: true }); } catch (e) {}
      }
      const next = patients.map((p) =>
        p.id === patientId
          ? { ...p, photos: (p.photos || []).filter((ph) => ph.id !== photoId) }
          : p
      );
      await persist(next);
    },
    [patients, persist]
  );

  const getPatient = useCallback((id) => patients.find((p) => p.id === id), [patients]);

  return (
    <PatientContext.Provider
      value={{
        patients,
        loaded,
        addPatient,
        updatePatient,
        deletePatient,
        setPhoto,
        deletePhoto,
        getPatient,
        exportPatientToAlbum,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export const usePatients = () => useContext(PatientContext);
