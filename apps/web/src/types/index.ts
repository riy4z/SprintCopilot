
export interface Project {
  Avatar: string;
  avatarUrls: { [key: string]: string };
  projectCategory: { id: string; name: string; description: string };
  id: string;
  key: string;
  name: string;
  teamSize: number;
  velocity: number;
  Category: string | null;
  sprintGraph: SprintData[];
}

export interface Sprint {
  projectKey: string,
  velocity: number,
  sprintHistory: [
    {
      sprintId: string,
      sprintName: string,
      startDate: string,
      endDate: string,
      completedPoints: number,
      committedPoints: number,
      completedTickets: number
    }
  ]
}

export interface SprintData {
  sprintName: string;
  velocity: number;
}

export interface Ticket {
  id: string;
  key: string;
  summary: string;
  status: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  type: "Bug" | "Story" | "Task" | "Epic";
  assignee: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;
  reporter: string;
  storyPoints: number;
  labels: string[];
  createdDate: string;
  updatedDate: string;
  parentIssueKey: string | null;
}


export  interface StoryTicketRequest{
  jiraId: string;
  jiraDescription: string;
}