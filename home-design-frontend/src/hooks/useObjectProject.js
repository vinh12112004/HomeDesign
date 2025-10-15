import { useState, useEffect, useCallback } from 'react';
import objectProjectApi from '../api/services/objectProjectApi';

export const useObjectProject = (projectId) => {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchObjects = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await objectProjectApi.getAll(projectId);
      setObjects(data || []);
    } catch (err) {
      console.warn('No objects found for this project:', err);
      setObjects([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const createObject = useCallback(async (objectData) => {
    if (!projectId) return null;

    try {
      setIsCreating(true);
      setError(null);
      const newObject = await objectProjectApi.create(projectId, objectData);
      setObjects(prev => [...prev, newObject]);
      return newObject;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [projectId]);

  const updateObject = useCallback(async (objectId, objectData) => {
    if (!projectId) return null;

    try {
      setIsUpdating(true);
      setError(null);
      const updatedObject = await objectProjectApi.update(projectId, objectId, objectData);
      setObjects(prev => prev.map(obj => obj.id === objectId ? updatedObject : obj));
      return updatedObject;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [projectId]);

  const deleteObject = useCallback(async (objectId) => {
    if (!projectId) return;

    try {
      setIsDeleting(true);
      setError(null);
      await objectProjectApi.delete(projectId, objectId);
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [projectId]);

  const getObjectById = useCallback(async (objectId) => {
    if (!projectId) return null;

    try {
      const object = await objectProjectApi.getById(projectId, objectId);
      return object;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [projectId]);

  return {
    objects,
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchObjects,
    createObject,
    updateObject,
    deleteObject,
    getObjectById,
  };
};