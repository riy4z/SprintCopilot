import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Project {
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    '48x48': string;
  };
}

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  clearSelectedProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'sprintflow_selected_project';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load selected project from cache:', error);
    }
    return null;
  });

  const setSelectedProject = (project: Project | null) => {
    setSelectedProjectState(project);

    // Save to localStorage
    try {
      if (project) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to cache selected project:', error);
    }
  };

  const clearSelectedProject = () => {
    setSelectedProject(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        clearSelectedProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useSelectedProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useSelectedProject must be used within a ProjectProvider');
  }
  return context;
}
