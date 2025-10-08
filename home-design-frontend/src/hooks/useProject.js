import { useState, useEffect, useCallback } from 'react';
import  projectApi from '../api/services/projectApi';

export const useProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll(); // Giả sử có hàm projectApi.getAll()
      setProjects(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData) => {
    try {
      setIsCreating(true);
      setError(null);
      const newProject = await projectApi.createProject(projectData);
      return newProject;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      setIsDeleting(true);
      await projectApi.deleteProject(projectId);
      setError(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);
  return {
    projects,
    loading,
    isCreating,
    isDeleting,
    deleteProject,
    error,
    fetchProjects,
    createProject,
  };
};