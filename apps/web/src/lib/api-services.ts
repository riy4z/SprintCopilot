import { data } from "react-router-dom";
import api from "./api";
import type {StoryTicketRequest, Project, Sprint, Ticket} from "@/types";


export interface ProjectsResponse {
  projects: Project[];
}

export interface AutoAssignRequest {
  users: {
    userId: string;
    totalVelocity: number;
    availableVelocity: number;
    skills?: string[]; 
  }[];
  jiraToBeSelected: {
    jiraid: string;
    storypoints: number;
    description?: string;
    labels?: string[];   
  }[];
}

export interface AutoAssignResponse {
  totalUnassignedTickets: number;
  totalStoryPoints: number;
  assignments: {
    userId: string;
    assignedStoryPoints: number;
    velocity: number;
    availableCapacity: number;
    remainingCapacity: number;
    jiras: {
      jiraId: string;
      storyPoints: number;
      assignmentReason: string;
    }[];
  }[];
  unassignableTickets: {
    jiraId: string;
    storyPoints: number;
    reason?: string;
  }[];
}

export interface RetrospectiveRequest {
  additionalContext?: string;
  teamHighlights?: string[];
  knownBlockers?: string[];
}

export interface SprintRetrospective {
  sprint: {
    sprintId: string;
    sprintName: string;
    projectKey: string;
    startDate: string; // ISO format: YYYY-MM-DD
    endDate: string;
  };
  summary: string;
  whatWentWell: string[];
  whatCouldBeImproved: string[];
  keyAchievements: string[];
  challenges: string[];
  actionItems: {
    title: string;
    description: string;
    priority: string
    owner: string;
  }[];
  metrics: {
    completedPoints: number;
    committedPoints: number;
    completedTickets: number;
    totalTickets: number;
    completionRate: number;
  };
  teamInsights: string;
  recommendations: string[];
}


// Backlog/Ticket Types


export interface BacklogResponse {
  tickets: Ticket[];
}



export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  sprintHistory: any[];
  velocity: number;
  usedStoryPoints: number;
  availableCapacity: number;
}

export interface TeamMembersResponse {
  projectKey: string;
  projectVelocity: number;
  teamMembers: TeamMember[];
  sprintHistory: any[];
}

// JIRA API
export const jira = {
  getProjects: async (): Promise<Ticket[]> => {
    const response = await api.post("/api/jira/projects", {
      baseUrl: "string",
      email: "string",
      apiToken: "string",
    });
    return response.data;
  },

  connectJira: () => {
    const AUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/connect`;
    window.location.href = AUTH_URL;
  },

  getBacklog: async (projectKey: string, jql: string): Promise<BacklogResponse> => {
    const response = await api.post(`/api/jira/backlog/${projectKey}`, {
      baseUrl: "string",
      email: "string",
      apiToken: "string",
    });

//     "projectKey": "sfqtc",
//     "totalTickets": 63,
//     "totalStoryPoints": 3,
//     "tickets": [
//         {
//             "id": "2406924",
//             "key": "SFQTC-1405",
//             "projectKey": "sfqtc",
//             "summary": "MSRP Pricing Update: Disti Net Price",
//             "description": "Business would like to update the MSRP / STP on existing quotes and offers for select SKUs. Business decision to honor Net Disti Price through batch process\r\n\r\n[Business requirement document|https://docs.google.com/document/d/12WtYDG26kVUyJXwXKdZgTK8lZJdJT9AnkAd8_9yYjhI/edit?tab=t.38wfevs21nyt]",
//             "status": "Waiting for Triage",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-28T12:03:20+05:30",
//             "updated": "2026-01-28T12:03:20+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2404897",
//             "key": "SFQTC-1402",
//             "projectKey": "sfqtc",
//             "summary": "Enable T1 Goal Seek",
//             "description": "Enable T1 Goal Seek discount type. This discount type will be needed to facilitate MSRP pricing revision and repricing operations, as well as repricing of migrated quotes.\r\n\r\n\u00A0\r\n\r\nT1 goal seek formal, provided by finance (Andrew McKay), is showed in the following spreadsheet\r\n\r\n[https://docs.google.com/spreadsheets/d/1qRxh0l0qxGLhbWuMGVgt0U7s-gZ2W6tjNqVNbchgXtI/edit?gid=1420349469#gid=1420349469]\r\n\r\n\u00A0",
//             "status": "Waiting for Triage",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [
//                 "DEV-OSF"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-26T21:53:16+05:30",
//             "updated": "2026-01-26T22:35:01+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2397252",
//             "key": "SFQTC-1379",
//             "projectKey": "sfqtc",
//             "summary": "Email bounced for Reseller",
//             "description": "With the issue with no notice that CDW Emails were bouncing, there should be the same tracking set up to track Reseller as Primary Disti on the Offer.\u00A0 CAM should be able to see that it did not go to their reseller.",
//             "status": "Waiting for Triage",
//             "priority": "Critical",
//             "type": "Task",
//             "assignee": "rsampathkumar",
//             "assigneeName": "Ramya Sampathkumar",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=19008",
//             "reporter": "Shannon Johnson",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-16T23:44:10+05:30",
//             "updated": "2026-01-17T00:54:46+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2391647",
//             "key": "SFQTC-1367",
//             "projectKey": "sfqtc",
//             "summary": "Fwd: Quote Approval Confirmation for LOGI - DR0001223483 - 4",
//             "description": "Requirement: OLI to be consolidated if the following attributes are the same:\r\n\r\nWhen a OLI with the same:\r\n * SKU #\r\n * Product Name\r\n * Unit MSRP\r\n * Distributor Cost\r\n * Term (Monthly)\r\n * DIscount Amount Per Unit\r\n * Distributor Cost After Discount\r\n * Line Start Date\r\n * Like End Date\r\n\r\nIf all above attributes are the same, then consolidate OLI into a single line and aggregate the quantity.\r\n\r\n*Tech notes:*\u00A0\r\n\r\nUpdate the consolidation logic in Class - OfferCommitmentLetterController\r\n\r\nmethod - mergeStandAloneLines()\r\n\r\n\u00A0\r\n\r\n\u00A0\r\n\r\n______________________________________________________________________________________________\r\n\r\n\u00A0\r\n\r\n\u00A0\r\n\r\nHello Team\r\n\r\nThe RB65 PN keeps showing an end date of 1/7/26. I have gone in and revised the quote by removing the part and adding it back and submitting it for approval. It keeps showing this date.\r\n\r\nAny help would be appreciated.\r\n\r\nThank you,\r\nTiffany\r\n\r\n*Tiffany McFarland* {color:#888888}|{color} {color:#339999} *Logitech*{color}\r\n{color:#888888}National Enterprise Account Manager | Video Collaboration | PNW\r\nM: 503.894.0877{color}\r\n\r\n{color:#888888}Looking for support? Visit our{color} [{color:#1155cc}Help Center{color}|https://sync.logitech.com/hub/support]{color:#888888} or{color} [{color:#1155cc}open a ticket here{color}|https://sync.logitech.com/hub/contact-support]\r\n{color:#888888}Interested in our premium support? Check out{color} [{color:#1155cc}Logitech Select{color}|https://select.logitech.com/LSC_VF_UserLoginPage?ec=302&startURL=%2Fs%2Fdashboard-content]\r\n{color:#888888}Need Logi for Business Support, Ask our{color} [{color:#1155cc}Instant Answer Bot{color}|https://hub.sync.logitech.com/instant-answers]!https://info.logitech.com/rs/201-WGH-889/images/Logitech_NextUp_Email%20Signature_GIF_650x150.gif?version=0! <[https://info.logitech.com/nextup?utm_campaign=B2B_FY26_Global_NextUp_NON_EN&utm_source=gmail&utm_medium=email&utm_content=signature_animated]>\r\n!https://info.logitech.com/rs/201-WGH-889/images/RallyBoard65-NPI-eSig-2411_520x150.png?version=0!\r\n\r\n---------- Forwarded message ---------\r\nFrom: *Logitech Sales* <[sales@logitech.com|mailto:sales@logitech.com]>\r\nDate: Fri, Jan 9, 2026 at 3:45\u202FPM\r\nSubject: Quote Approval Confirmation for LOGI - DR0001223483 - 4\r\nTo: [jigonzalez@diversifiedus.com|mailto:jigonzalez@diversifiedus.com] <[jigonzalez@diversifiedus.com|mailto:jigonzalez@diversifiedus.com]>\r\nCc: [blohrey@logitech.com|mailto:blohrey@logitech.com] <[blohrey@logitech.com|mailto:blohrey@logitech.com]>, [tmcfarland@logitech.com|mailto:tmcfarland@logitech.com] <[tmcfarland@logitech.com|mailto:tmcfarland@logitech.com]>, [mtrapani@logitech.com|mailto:mtrapani@logitech.com] <[mtrapani@logitech.com|mailto:mtrapani@logitech.com]>, [jigonzalez@diversifiedus.com|mailto:jigonzalez@diversifiedus.com] <[jigonzalez@diversifiedus.com|mailto:jigonzalez@diversifiedus.com]>{color:#0a0a0a} {color}\r\n|{color:#0a0a0a} {color}{color:#0a0a0a} {color}|\r\n|{color:#0a0a0a} {color}{color:#0a0a0a} {color}|\r\n||{color:#0a0a0a} {color}{color:#0a0a0a} {color}||\r\n||!https://partners.logitech.com/images/emails/logos/logo.png!{color:#ffffff} <[https://www.logitech.com/en-us/solutions/business]>{color}{color:#0a0a0a} {color}||{color:#0a0a0a} {color}{color:#0a0a0a} {color}|{color:#0a0a0a} {color}\r\n{color:#0a0a0a} {color} {color:#0a0a0a} {color}{color:#0a0a0a} {color}|\r\n||{color:#0a0a0a} {color}{color:#0a0a0a} {color}||\r\n||{color:#0a0a0a} \r\n*We're pleased to inform you that the special pricing has been approved. Please find the details attached for your reference.* *Your preferred distributor has also received the pricing details for this opportunity and will provide you with a quote shortly.* \r\nTHIS QUOTE SUPERSEDES ALL PREVIOUS VERSIONS OF QUOTES SENT. {color}{color:#0a0a0a} {color}||\r\n|{color:#0a0a0a} *Distributor* \r\nLogitech Bid Desk \r\nTD Synnex US \r\n39 Pelham Ridge Drive \r\nGreenville, South Carolina \r\nUnited States {color}{color:#0a0a0a} {color}|{color:#0a0a0a} *Reseller* Jimi Gonzalez{color} \r\n[{color:#0a0a0a}jigonzalez@diversifiedus.com{color}|mailto:jigonzalez@diversifiedus.com]{color:#0a0a0a} Diversified AV 37 Market Street Kenilworth, New Jersey United States {color}{color:#0a0a0a} {color}|\r\n|{color:#0a0a0a} *End Customer* \r\nDima Gurmeza{color} \r\n[{color:#0a0a0a}dgurmeza@blueorigin.com{color}|mailto:dgurmeza@blueorigin.com]{color:#0a0a0a} \r\nBlue Origin \r\n21218 76th Ave S \r\nKent, Washington \r\nUnited States {color}{color:#0a0a0a} {color}|{color:#0a0a0a} *Logitech Sales* Tiffany McFarland{color} \r\n[{color:#0a0a0a}tmcfarland@logitech.com{color}|mailto:tmcfarland@logitech.com]{color:#0a0a0a} {color}{color:#0a0a0a} {color}|\r\n\r\n{color:#0a0a0a} {color}{color:#0a0a0a} {color}\r\n||{color:#0a0a0a} *Deal Information* {color}{color:#0a0a0a} {color}||\r\n|{color:#0a0a0a} {color}{color:#0a0a0a} {color}|\r\n|{color:#0a0a0a} *Deal ID:* LOGI - DR0001223483 *Quote Name:* LOGI - DR0001223483 - V1 *Version:* 4 {color}{color:#0a0a0a} {color}|{color:#0a0a0a} *Price Effective Date:* 11/07/2025 *Price End Date:* 12/25/2026 *Issue Date & Time:* 01/09/2026 11:45 PM (UTC) {color}{color:#0a0a0a} {color}|{color:#0a0a0a} {color}{color:#0a0a0a} {color} \r\n{color:#0a0a0a} {color}{color:#0a0a0a} {color}|\r\n|{color:#0a0a0a} *Parts to Quote* {color}{color:#0a0a0a} {color}|{color:#0a0a0a} All prices in USD {color}{color:#0a0a0a} {color}|\r\n\r\n\u00A0\r\n||{color:#0a0a0a}\r\nSKU #{color}||{color:#0a0a0a}Product Name{color}||{color:#0a0a0a}Unit MSRP{color}||{color:#0a0a0a}Quote Quantity{color}||{color:#0a0a0a}Term (Months){color}||{color:#0a0a0a}Line Start Date{color}||{color:#0a0a0a}Line End Date{color}||\r\n|{color:#0a0a0a}TAPMSTBASEASU2{color}|{color:#0a0a0a}TAPMSTBASEASU2{color}|{color:#0a0a0a}1,218.99{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}TAPMUPMSTASU2{color}|{color:#0a0a0a}TAPMUPMSTASU2{color}|{color:#0a0a0a}1,917.99{color}|{color:#0a0a0a}2{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}TAPRALMSTASU2{color}|{color:#0a0a0a}TAPRALMSTASU2{color}|{color:#0a0a0a}3,697.98{color}|{color:#0a0a0a}2{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}4,497.97{color}|{color:#0a0a0a}2{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000097{color}|{color:#0a0a0a}Compute Mount{color}|{color:#0a0a0a}119.99{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001697{color}|{color:#0a0a0a}Logitech Rally Board 65{color}|{color:#0a0a0a}6,999.00{color}|{color:#0a0a0a}65{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}01/07/2026{color}|{color:#0a0a0a}01/07/2026{color}|\r\n|{color:#0a0a0a}991-000562{color}|{color:#0a0a0a}Logitech Rally Board 65 KIT{color}|{color:#0a0a0a}9,799.00{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001101{color}|{color:#0a0a0a}MEETUP{color}|{color:#0a0a0a}699.00{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001217{color}|{color:#0a0a0a}RALLY AMR/AP{color}|{color:#0a0a0a}2,299.00{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001564{color}|{color:#0a0a0a}RALLY BAR AMR/AP{color}|{color:#0a0a0a}4,199.00{color}|{color:#0a0a0a}40{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001485{color}|{color:#0a0a0a}Rally Bar Huddle{color}|{color:#0a0a0a}1,899.00{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001563{color}|{color:#0a0a0a}RALLY BAR MINI AMR/AP{color}|{color:#0a0a0a}3,299.00{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001336{color}|{color:#0a0a0a}RALLY BAR MINI AMR/AP{color}|{color:#0a0a0a}3,299.00{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001226{color}|{color:#0a0a0a}RALLY CAMERA{color}|{color:#0a0a0a}1,399.00{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}989-000430{color}|{color:#0a0a0a}Rally Mic Pod{color}|{color:#0a0a0a}399.99{color}|{color:#0a0a0a}40{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000038{color}|{color:#0a0a0a}RALLY MIC POD{color}|{color:#0a0a0a}399.99{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000047{color}|{color:#0a0a0a}RALLY MIC POD EXTENSION CABLE{color}|{color:#0a0a0a}239.99{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001647{color}|{color:#0a0a0a}Rally Mic Pod Hub{color}|{color:#0a0a0a}299.99{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000002{color}|{color:#0a0a0a}RALLY MIC POD TABLE MOUNT{color}|{color:#0a0a0a}84.99{color}|{color:#0a0a0a}40{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000020{color}|{color:#0a0a0a}RALLY MIC POD TABLE MOUNT{color}|{color:#0a0a0a}84.99{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001644{color}|{color:#0a0a0a}Rally Mounting Kit{color}|{color:#0a0a0a}179.99{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001225{color}|{color:#0a0a0a}RALLY PLUS AMR{color}|{color:#0a0a0a}2,799.00{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}950-000081{color}|{color:#0a0a0a}RoomMate{color}|{color:#0a0a0a}1,099.00{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001332{color}|{color:#0a0a0a}SCRIBE WW{color}|{color:#0a0a0a}1,299.00{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001510{color}|{color:#0a0a0a}Sight{color}|{color:#0a0a0a}2,199.00{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001805{color}|{color:#0a0a0a}STRONG USB 3.1 CABLE{color}|{color:#0a0a0a}1,199.99{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001950{color}|{color:#0a0a0a}TAP{color}|{color:#0a0a0a}1,099.00{color}|{color:#0a0a0a}60{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000085{color}|{color:#0a0a0a}TAP IP{color}|{color:#0a0a0a}749.00{color}|{color:#0a0a0a}40{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000080{color}|{color:#0a0a0a}Tap Riser Mount{color}|{color:#0a0a0a}239.99{color}|{color:#0a0a0a}40{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000094{color}|{color:#0a0a0a}TAP SCHEDULER{color}|{color:#0a0a0a}799.00{color}|{color:#0a0a0a}30{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001817{color}|{color:#0a0a0a}Tap Wall Mount{color}|{color:#0a0a0a}249.99{color}|{color:#0a0a0a}10{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000041{color}|{color:#0a0a0a}TV MOUNT FOR VIDEO BARS{color}|{color:#0a0a0a}219.99{color}|{color:#0a0a0a}5{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000044{color}|{color:#0a0a0a}WALL MOUNT FOR VIDEO BARS{color}|{color:#0a0a0a}99.99{color}|{color:#0a0a0a}30{color}|{color:#0a0a0a}0{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n\r\n{color:#0a0a0a}\r\n\r\n\r\n*Bundle BOM Detail for Reference* {color}\r\n||{color:#0a0a0a}\r\nSKU #{color}||{color:#0a0a0a}Product Name{color}||{color:#0a0a0a}Bundle{color}||{color:#0a0a0a}Unit MSRP{color}||{color:#0a0a0a}Line Start Date{color}||{color:#0a0a0a}Line End Date{color}||\r\n|{color:#0a0a0a}TEAMS-LOG13L3KV5{color}|{color:#0a0a0a}ASUS NUC{color}|{color:#0a0a0a}TAPMSTBASEASU2{color}|{color:#0a0a0a}Third Party SKU{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000097{color}|{color:#0a0a0a}Compute Mount{color}|{color:#0a0a0a}TAPMSTBASEASU2{color}|{color:#0a0a0a}119.99{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001950{color}|{color:#0a0a0a}TAP{color}|{color:#0a0a0a}TAPMSTBASEASU2{color}|{color:#0a0a0a}1,099.00{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}TEAMS-LOG13L3KV5{color}|{color:#0a0a0a}ASUS NUC{color}|{color:#0a0a0a}TAPMUPMSTASU2{color}|{color:#0a0a0a}Third Party SKU{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000097{color}|{color:#0a0a0a}Compute Mount{color}|{color:#0a0a0a}TAPMUPMSTASU2{color}|{color:#0a0a0a}119.99{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001101{color}|{color:#0a0a0a}MEETUP{color}|{color:#0a0a0a}TAPMUPMSTASU2{color}|{color:#0a0a0a}699.00{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001950{color}|{color:#0a0a0a}TAP{color}|{color:#0a0a0a}TAPMUPMSTASU2{color}|{color:#0a0a0a}1,099.00{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}TEAMS-LOG13L3KV5{color}|{color:#0a0a0a}ASUS NUC{color}|{color:#0a0a0a}TAPRALMSTASU2{color}|{color:#0a0a0a}Third Party SKU{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000097{color}|{color:#0a0a0a}Compute Mount{color}|{color:#0a0a0a}TAPRALMSTASU2{color}|{color:#0a0a0a}119.99{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001217{color}|{color:#0a0a0a}RALLY AMR/AP{color}|{color:#0a0a0a}TAPRALMSTASU2{color}|{color:#0a0a0a}2,299.00{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001644{color}|{color:#0a0a0a}Rally Mounting Kit{color}|{color:#0a0a0a}TAPRALMSTASU2{color}|{color:#0a0a0a}179.99{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001950{color}|{color:#0a0a0a}TAP{color}|{color:#0a0a0a}TAPRALMSTASU2{color}|{color:#0a0a0a}1,099.00{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}TEAMS-LOG13L3KV5{color}|{color:#0a0a0a}ASUS NUC{color}|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}Third Party SKU{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}952-000097{color}|{color:#0a0a0a}Compute Mount{color}|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}119.99{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001647{color}|{color:#0a0a0a}Rally Mic Pod Hub{color}|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}299.99{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001644{color}|{color:#0a0a0a}Rally Mounting Kit{color}|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}179.99{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}960-001225{color}|{color:#0a0a0a}RALLY PLUS AMR{color}|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}2,799.00{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n|{color:#0a0a0a}939-001950{color}|{color:#0a0a0a}TAP{color}|{color:#0a0a0a}TAPRAPMSTASU2{color}|{color:#0a0a0a}1,099.00{color}|{color:#0a0a0a}11/07/2025{color}|{color:#0a0a0a}12/25/2026{color}|\r\n\r\n{color:#0a0a0a}\r\n\r\n\r\nNote: Bundle MSRP excludes third party components and various distributor integration fees. Discount allowance is not stackable or combinable (unless authorized by Logitech) with other rebates. {color}{color:#0a0a0a} {color}{color:#0a0a0a} {color}{color:#0a0a0a} {color} {color:#0a0a0a} {color}\r\n{color:#0a0a0a} {color} \r\n{color:#0a0a0a} {color}{color:#0a0a0a} {color}\r\n||{color:#0a0a0a} {color}{color:#0a0a0a} {color}{color:#0a0a0a} {color}\r\n{color:#0a0a0a} {color}||\r\n\r\n{color:#0a0a0a} {color}{color:#0a0a0a} {color}\r\n||{color:#ffffff} {color}{color:#ffffff} {color}||\r\n||{color:#ffffff} © 2026 Logitech. All rights reserved{color}{color:#ffffff} {color}{color:#ffffff} {color}|{color:#ffffff} {color}\r\n{color:#0a0a0a} {color}{color:#ffffff} {color}{color:#ffffff} {color}|\r\n||!https://partners.logitech.com/images/emails/logos/logo-small.png!{color:#000000} <[https://www.logitech.com|https://www.logitech.com/]>{color}{color:#ffffff} {color}|{color:#ffffff} {color}\r\n{color:#0a0a0a} {color} \r\n{color:#0a0a0a} {color}\r\n{color:#0a0a0a} {color} \r\n{color:#0a0a0a} {color}\r\n{color:#0a0a0a} {color} \r\n\u00A0\r\n!https://logitechsales.my.salesforce.com/servlet/servlet.ImageServer?oid=00D50000000JGX6&esid=018Pb000019icv8&from=ext!|",
//             "status": "In Progress",
//             "priority": "Critical",
//             "type": "Bug",
//             "assignee": "lalexandrino",
//             "assigneeName": "Leandro Alexandrino",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Tiffany McFarland",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-10T05:25:00+05:30",
//             "updated": "2026-01-29T02:33:02+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2390415",
//             "key": "SFQTC-1354",
//             "projectKey": "sfqtc",
//             "summary": "Report results (Offer Code Error)",
//             "description": "{color:white}Total Records 16{color} \n|||||||\n||||h1.{color:#080707} Offer Code Error{color}\n{color:#080707}{color}{color:#54698d}As of 1/9/26 at 4:00 AM · Viewing as Ask Salesforce{color}|||\n||||\n|{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}OPEN IN SALESFORCE{color}|https://logitechsales.lightning.force.com/lightning/r/Report/00OPb00000GdGdBMAV/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}\n\nDetails\n\n{color}{color:#080707}Filters{color}{color:#16325c}{color}{color:#16325c}All offers{color}{color:#16325c}{color}{color:#16325c}Offer: Created Date: 12/1/25 - Any{color}{color:#16325c}{color}{color:#16325c}OCRM Offer Code Exception not equal to{color} {color:#16325c}{color}{color:#16325c}Offer Status not equal to Active,Cancelled,Superseded{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#080707}Your report meets these conditions:{color}\n{color:#16325c}{color}{color:#080707}'Record Count' is 16 and is greater than 0.{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}\n\nSummary{color}{color:#16325c}\n{color}\n||{color:#16325c}{color}{color:#080707}Total Records{color}{color:#080707}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#080707}16{color}{color:#080707}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}\n{color}{color:#54698d}\n{color}\n||{color:#54698d}\nOCRM Offer Code Exception{color}{color:#54698d}{color}||{color:#54698d}Offer: Created Date{color}{color:#54698d}{color}||{color:#54698d}Offer: Offer Number{color}{color:#54698d}{color}||{color:#54698d}Offer Status{color}{color:#54698d}{color}||{color:#54698d}Quote{color}{color:#54698d}{color}||{color:#54698d}Opportunity{color}{color:#54698d}{color}||{color:#54698d}Start Date{color}{color:#54698d}{color}||{color:#54698d}End Customer{color}{color:#54698d}{color}||{color:#54698d}End Customer Name{color}{color:#54698d}{color}||{color:#54698d}Reseller{color}{color:#54698d}{color}||{color:#54698d}Reseller Contact{color}{color:#54698d}{color}||{color:#54698d}Distributor{color}{color:#54698d}{color}||{color:#54698d}Distributor Contact{color}{color:#54698d}{color}|\n{color:#16325c}{color}\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId10579..952-000044:_LINE Start Date and LINE End Date cannot be less than Current date.{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/3/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-034666{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003vLFiIAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001250709 - Ply Gem Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000XT52vKAD/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Ply Gem Canada-TWS Teams, Dynamic Security, FY26 DR_P{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000vtlogIAA/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}10/15/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Ply Gem Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0014X00002mTX5zQAG/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Becky Zulkowsky{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Dynamic Security Solutions Inc{color}|https://logitechsales.lightning.force.com/lightning/r/0014X00002mTSPKQA4/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Bill Khouri{color}|https://logitechsales.lightning.force.com/lightning/r/0034X00003SeXkwQAF/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}TD SYNNEX Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002eQ4LtQAK/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}TDS Canada Team Inbox{color}|https://logitechsales.lightning.force.com/lightning/r/0034X00003ScALnQAN/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId10580..952-000044:_LINE Start Date and LINE End Date cannot be less than Current date.{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/3/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-034667{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003vLFjIAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001250709 - Ply Gem Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000XT52vKAD/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Ply Gem Canada-TWS Teams, Dynamic Security, FY26 DR_P{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000vtlogIAA/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}10/15/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Ply Gem Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0014X00002mTX5zQAG/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Becky Zulkowsky{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Dynamic Security Solutions Inc{color}|https://logitechsales.lightning.force.com/lightning/r/0014X00002mTSPKQA4/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Bill Khouri{color}|https://logitechsales.lightning.force.com/lightning/r/0034X00003SeXkwQAF/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Ingram Micro Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002eNj3YQAS/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Logitech Ingram Micro{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00001AbJ2IIAV/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId11948._Invalid Distribution MDM Id._Unable to derive Valid Partner Contact Name._Unable to derive country for the Distributor.{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/16/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-036062{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb0000043vIoIAI/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001233429 - Lucid Motors{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000cd9GrKAI/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Lucid Motors-DR-Yorktel-13th Floor Expansion_P{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000rz0ZFIAY/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/16/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Lucid Motors{color}|https://logitechsales.lightning.force.com/lightning/r/0015000001W15xkAAB/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Reuben Bush{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Yorktel{color}|https://logitechsales.lightning.force.com/lightning/r/0015000001PcC1UAAV/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Tucker LaCaze{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00000ZIJuTIAX/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Midwich{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002RwaclQAB/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}-{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId12278._Offer Start Date and Offer End Date cannot be less than Current date.{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/17/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-036353{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb0000045UETIA2/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - O000285986 - Huntington Bancshares{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000UemCkKAJ/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Huntington Bancshares - Q3FY26 Runrate{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000h3yBlIAI/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}9/15/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Huntington Bancshares{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000sLidvAAC/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Bruce Metcalf{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Insight Direct US{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000iKnnjAAC/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Jaime Greene{color}|https://logitechsales.lightning.force.com/lightning/r/0034X00003SeDyrQAF/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}D&H Distributors{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000iMKzQAAW/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Logitech Specialist Team Inbox{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00001ANhlyIAD/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId12277._Offer Start Date and Offer End Date cannot be less than Current date.{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/17/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-036354{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb0000045UEUIA2/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - O000285986 - Huntington Bancshares{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000Uq4UTKAZ/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Huntington Bancshares - Q3FY26 Runrate{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000h3yBlIAI/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}9/15/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Huntington Bancshares{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000sLidvAAC/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Bruce Metcalf{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}World Wide Technology{color}|https://logitechsales.lightning.force.com/lightning/r/0015000001PcC1EAAV/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Zach Meier{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00000g3Y52IAE/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}D&H Distributors{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000iMKzQAAW/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Logitech Specialist Team Inbox{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00001ANhlyIAD/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId12246._Offer Start Date and Offer End Date cannot be less than Current date.{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/17/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-036356{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb0000045UG5IAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001173349 - V1{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000UACQ3KAP/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Trinity Health - PWS Ongoing - CDW DR_P{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000h3HRmIAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}9/30/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Trinity Health{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000sLifJAAS/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Peter Drouillard{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}CDW{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000ftVnDAAU/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Chris Dionesotes{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00000YMtAkIAL/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}TD Synnex US{color}|https://logitechsales.lightning.force.com/lightning/r/0015000001PcC1dAAF/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Logitech Bid Desk{color}|https://logitechsales.lightning.force.com/lightning/r/0035000003B9gROAAZ/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId12273._Offer Start Date and Offer End Date cannot be less than Current date.{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/17/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-036357{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb0000045UG6IAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001173349 - V1{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000UACQ3KAP/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Trinity Health - PWS Ongoing - CDW DR_P{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000h3HRmIAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}9/30/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Trinity Health{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000sLifJAAS/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Peter Drouillard{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}CDW{color}|https://logitechsales.lightning.force.com/lightning/r/0015000000ftVnDAAU/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Chris Dionesotes{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00000YMtAkIAL/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Ingram Micro US{color}|https://logitechsales.lightning.force.com/lightning/r/0015000001PcC1VAAV/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Logitech Team{color}|https://logitechsales.lightning.force.com/lightning/r/0035000003B9aFbAAJ/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}Collection is empty{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/30/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-036998{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb000004BEoXIAW/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - O000301496 - Staples+TD-IM{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000UeyfJKAR/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}DND-FY26Q3-10000_X_H570E_MSFT_USB-C-SPA+Hypertec_P{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb00000qFVS9IAO/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}9/15/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Department of National Defence{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002U2lJzQAJ/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Richard Reeve{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Staples Business Advantage Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002ZOlkjQAD/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Tony D. Zhang{color}|https://logitechsales.lightning.force.com/lightning/r/003Pb00000rXmTcIAK/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}TD SYNNEX Canada{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002eQ4LtQAK/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}TDS Canada Team Inbox{color}|https://logitechsales.lightning.force.com/lightning/r/0034X00003ScALnQAN/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId12922..939-001950:_LINE Start Date and LINE End Date cannot be less than Current date..960-001336:_LINE Start Date and LINE End Date cannot be less than Current date..939-001950:_LINE Start Date and LINE End Date cannot be less ...{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}1/1/2026{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-037036{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb000004CP5BIAW/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001267813 - B-Flexion (US){color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000bOoPlKAK/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}B-Flexion (US)-Verrex DR VC{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb000012LS9LIAW/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/1/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}B-Flexion (US){color}|https://logitechsales.lightning.force.com/lightning/r/001Pb000036xAL0IAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Jeury Soto{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Verrex LLC{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002OmDAyQAN/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Tyler Condry{color}|https://logitechsales.lightning.force.com/lightning/r/0031T00004QDiVmQAL/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}TD Synnex US{color}|https://logitechsales.lightning.force.com/lightning/r/0015000001PcC1dAAF/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Logitech Bid Desk{color}|https://logitechsales.lightning.force.com/lightning/r/0035000003B9gROAAZ/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId12921..939-001950:_LINE Start Date and LINE End Date cannot be less than Current date..960-001336:_LINE Start Date and LINE End Date cannot be less than Current date..939-001950:_LINE Start Date and LINE End Date cannot be less ...{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}1/1/2026{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-037037{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb000004CP5CIAW/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001267813 - B-Flexion (US){color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000bOoPlKAK/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}B-Flexion (US)-Verrex DR VC{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb000012LS9LIAW/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}12/1/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}B-Flexion (US){color}|https://logitechsales.lightning.force.com/lightning/r/001Pb000036xAL0IAM/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Jeury Soto{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Verrex LLC{color}|https://logitechsales.lightning.force.com/lightning/r/0011T00002OmDAyQAN/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Tyler Condry{color}|https://logitechsales.lightning.force.com/lightning/r/0031T00004QDiVmQAL/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Starin Marketing, Inc dba MIDWICH US{color}|https://logitechsales.lightning.force.com/lightning/r/0015000001TlSy2AAF/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Midwich SPA{color}|https://logitechsales.lightning.force.com/lightning/r/0031T00004LPdezQAD/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|\n|{color:#16325c}{color}{color:#16325c}STATUS MESSAGE : BatchId13197..960-001308:_LINE Start Date and LINE End Date cannot be less than Current date..952-000097:_LINE Start Date and LINE End Date cannot be less than Current date..939-001950:_LINE Start Date and LINE End Date cannot be less ...{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}1/6/2026{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}O-037313{color}|https://logitechsales.lightning.force.com/lightning/r/a0bPb000004Dx4nIAC/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Pending{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}LOGI - DR0001262759 - Stites & Harbison{color}|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000aME2nKAG/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Stites & Harbison-TWS-Q1-Trace3-DR{color}|https://logitechsales.lightning.force.com/lightning/r/006Pb000010uGhVIAU/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}11/19/2025{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#16325c}{color}{color:#0070d2}Stites & Harbison{color}|https://logitechsales.lightning.force.com/lightning/r/001Pb00003376rrIAA/view]{color:#0070d2}{color}{color:#16325c}{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}Lee Pfeiffer{color}{color:#16325c}{color}{color:#16325c}{color}|{color:#16325c}{color}{color:#16325c}{color}[{color:#1\nThis content has been cut by Email This Issue as it exceeds the configured Jira character limit for this field. Please find the full email under the Emails tab.",
//             "status": "In Progress",
//             "priority": "Critical",
//             "type": "Bug",
//             "assignee": "rsampathkumar",
//             "assigneeName": "Ramya Sampathkumar",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=19008",
//             "reporter": "Outsider - SFDC",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-09T17:35:01+05:30",
//             "updated": "2026-01-09T19:40:40+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2389582",
//             "key": "SFQTC-1352",
//             "projectKey": "sfqtc",
//             "summary": "Scenario 1: Multi-Quarter / Multi-Year Opportunity Splitting",
//             "description": "https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3b051b057b8_0_102#slide=id.g3b051b057b8_0_102\r\n\r\nNote - Implementation wise no changes, need to ensure explicite scenario is tested ACs documented so creating different story. This should include all existing SPlit opportunity regression testing.",
//             "status": "Waiting for Triage",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-08T23:44:55+05:30",
//             "updated": "2026-01-09T22:29:02+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2389579",
//             "key": "SFQTC-1351",
//             "projectKey": "sfqtc",
//             "summary": "Scenario 6: Multiple Product/Room Options Presented",
//             "description": "https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3ae819fd1db_0_79#slide=id.g3ae819fd1db_0_79\r\n\r\nNote - Implementation wise same solution, need to ensure explicite scenario is tested ACs documented so creating different story",
//             "status": "Waiting for Triage",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-08T23:41:41+05:30",
//             "updated": "2026-01-09T22:29:02+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2389577",
//             "key": "SFQTC-1350",
//             "projectKey": "sfqtc",
//             "summary": "Scenario 5: Additional Discount or Price Changes After Multiple Splits",
//             "description": "\r\nhttps://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3ae819fd1db_0_72#slide=id.g3ae819fd1db_0_72\r\n",
//             "status": "Waiting for Triage",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-08T23:39:01+05:30",
//             "updated": "2026-01-09T22:29:02+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2389564",
//             "key": "SFQTC-1347",
//             "projectKey": "sfqtc",
//             "summary": "Scenario 3: Syncing a new quote to Split Opportunity",
//             "description": "As a seller, I want to ability to sync a new quote to my split opportunity so that I can identify the winning BOM and continue my split operation off the new BOM\r\n\r\nRequirements:\r\n * Syncing of new quote will not impact existing closed (won/lost) child opportunities\r\n * If open child opportunity has a product that is not on the new syncing quote, product to be removed from open child opportunity\r\n\r\n\u00A0\r\n\r\n[https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3b19835578d_0_72#slide=id.g3b19835578d_0_72]\r\n\r\n[https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3b19835578d_0_61#slide=id.g3b19835578d_0_61]\r\n\r\n\u00A0\r\n\r\nOpen question:\r\n\r\n- What is the desired behavior for opportunity products?\r\n\r\n\u00A0\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-08T23:24:58+05:30",
//             "updated": "2026-01-29T12:53:26+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2361648",
//             "key": "SFQTC-1243",
//             "projectKey": "sfqtc",
//             "summary": "Enable SPA quote expiration beyond March 31 2026",
//             "description": "Update validation rule for quote expiry date from March 31, 2026 to May 31, 2026. This is applied to SPA quotes only\r\n\r\nLegacy quotes will continue to expire prior to March 31, 2026. Legacy will need to be cloned for a new quote after it expires.\r\n\r\nThe VR as described in this story will be overridden once SFQTC-1204 is enabled\r\n\r\nOut of scope:\r\n\r\nDR quotes\r\n\r\n*Tech Notes:*\r\n\r\nUpdate an existing validation rule on Quote - Expiration_Date_Check\r\n * Extend the date from March 31 to May 31, 2026 Add a additional condition to check for non migrated/new RCA quotes. i.e. (Is_RCA_Quote_{_}c = true && (Source{_}{_}c = null OR Source{_}{_}c.Is_RCA_Quote{_}_c = true)\r\n * Keep the date as March 31 for migrated quotes.\u00A0 i.e. (Is_RCA_Quote_{_}c = true &&\u00A0 Source{_}{_}c.Is_RCA_Quote{_}_c = false)",
//             "status": "Ready for Release",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": "akatragadda",
//             "assigneeName": "Anjali Katragadda",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [
//                 "SOXControlRequired"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-03T23:31:08+05:30",
//             "updated": "2026-01-28T02:23:47+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2354844",
//             "key": "SFQTC-1202",
//             "projectKey": "sfqtc",
//             "summary": "Clone Quote Selection Pop Up",
//             "description": "h3. User Story:\r\n\r\nAs a seller in Salesforce, I want to be able to select the quote that I want to clone in my cloned opportunity so that I can reduce the amount of time I need to set up an opportunity and quote to start transacting.\r\n\r\n\u00A0\r\n\r\nClone quote selection pop up will be similar to that developed for SFQTC-519\r\nh3. Acceptance Criteria\r\n * See above\r\n\r\nh3. Constraints\r\n * Solution should not allow for cloning of Legacy Quotes\r\n * Solution should not clone historical price\r\n\r\nh3. Systems Impacted\r\n * Salesforce RCA\r\n\r\nh3. Persona(s)\r\n * Sales User\r\n\r\n*Tech Notes:*\r\n\r\nUse the same design used in SFQTC-519 to display the popup. The columns to display should be driven by custom setting. The columns to display on Clone with Related and Convert DR to SPA should be stored in a separate settings.\r\n\r\n\u00A0\r\n\r\n[SFQTC-1202 Test Cases|https://docs.google.com/spreadsheets/d/1xEdXo00AcDzgMfbUp2x1M7rGyio47tMvjMR6wRiL348/edit?gid=1607056039#gid=1607056039]",
//             "status": "UAT",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": "akatragadda",
//             "assigneeName": "Anjali Katragadda",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": 0,
//             "labels": [
//                 "Ph1A_FastFollow"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-11-26T05:15:45+05:30",
//             "updated": "2026-01-28T12:12:06+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2340287",
//             "key": "SFQTC-1166",
//             "projectKey": "sfqtc",
//             "summary": "Error Message when trying to convert SPA request to existing SPA oppty.",
//             "description": "I'm trying to convert this SPA request to an existing opportunity. But I am getting the below error message. I ran this by [@Shannon Johnson|mailto:sjohnson4@logitech.com] and she thinks it should work. But it's not. \n\nSPA Request: \n[https://logitechsales.lightning.force.com/lightning/r/Lead/00QPb000011q1LYMAY/view|https://logitechsales.lightning.force.com/lightning/r/Lead/00QPb000011q1LYMAY/view]\n\nExisting Opportunity: \n[https://logitechsales.lightning.force.com/lightning/r/Opportunity/006Pb00000yRfaoIAC/view|https://logitechsales.lightning.force.com/lightning/r/Opportunity/006Pb00000yRfaoIAC/view]\n\nPlease note, this is time sensitive.\n\n\n !image.png|thumbnail!\n\n\n\n\n{color:#222222}{color}{color:#ff0000}{color}\n{color:#222222}{color}\n\n{color:#222222}{color}{color:#ff0000}Upcoming Out of Office:{color}{color:#222222}{color}{color:#222222}{color}\n\n\n\n{color:#222222}{color}{color:#ff0000}Wednesday 11/12 - Friday 11/21{color}{color:#222222}{color}\n\n{color:#666666}{color}\n\n\n *{color:#666666} *Cody Crawford*{color}{color:#00b8fc} {color}*{color:#666666}(he/him){color}\n\n{color:#666666} *Enterprise Account Manager, Northern California*{color}\n{color:#666666}Logitech For Business{color}{color:#222222}{color}\n\n\n\n{color:#666666}p:{color} {color:#666666}+1-510-713-5576  <tel:+1-510-713-5576>| m:{color} {color:#666666}+1-925-750-4220 <tel:+1-925-750-4220>{color}\n\n\n",
//             "status": "Design Required",
//             "priority": "Critical",
//             "type": "Bug",
//             "assignee": "rsampathkumar",
//             "assigneeName": "Ramya Sampathkumar",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=19008",
//             "reporter": "Cody Crawford",
//             "storyPoints": null,
//             "labels": [
//                 "SalesTeam"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-11-07T05:26:00+05:30",
//             "updated": "2025-11-18T20:13:17+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2334003",
//             "key": "SFQTC-1133",
//             "projectKey": "sfqtc",
//             "summary": "Impartner- Attach Services Toggle",
//             "description": "As a Reseller/Disti using Partner Portal, I want an easy and accessible way to toggle on or off the recommended services engine while editing the quote, so that I can quickly configure the quote to what I am trying to sell.\r\n\r\n\u00A0\r\n\r\nToggle should be at the top of the quote page here without impacting the viewability of other fields:\r\n\r\n*Tech Design* : https://docs.google.com/document/d/18Hh6D_zx9WSS3QUScUOrSV0rspuxJiafgexYlbiYk-k/edit?tab=t.0",
//             "status": "UAT",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": "mwilcox",
//             "assigneeName": "Marra Wilcox",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [
//                 "Impartner",
//                 "Must_Have",
//                 "Ph1A_FastFollow",
//                 "ServiceAttach"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-10-31T04:57:57+05:30",
//             "updated": "2026-01-20T11:55:29+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2317226",
//             "key": "SFQTC-1061",
//             "projectKey": "sfqtc",
//             "summary": "Constant error messages",
//             "description": "Deleting line items and adjusting quantities on this quote has been a painful process. Sometimes, if I try to delete lines one by one, it works fine (but it takes forever). Other times, when I delete in batches, I get error messages, and sometimes the deletion works. \n\nThis time, I was trying to delete all part numbers associated with the original Meetup, and this is one of the several error messages I keep getting. \n\nI did it four times, and it finally worked. \n\nThis is not sustainable.\n\n[https://logitechsales.lightning.force.com/lightning/r/Quote/0Q0Pb00000WvnzGKAR/view|https://logitechsales.lightning.force.com/lightning/r/Quote/0Q0Pb00000WvnzGKAR/view]\n\n !image.png|thumbnail!\n\n !image.png|thumbnail!\n\n\n\n\n\n\n{color:#222222}{color}{color:#ff0000}Upcoming Out of Office:{color}{color:#222222}{color}{color:#222222}{color}\n\n\n\n{color:#222222}{color}{color:#ff0000}Wednesday 11/12 - Friday 11/21{color}{color:#222222}{color}\n\n{color:#666666}{color}\n\n\n *{color:#666666} *Cody Crawford*{color}{color:#00b8fc} {color}*{color:#666666}(he/him){color}\n\n{color:#666666} *Enterprise Account Manager, Northern California*{color}\n{color:#666666}Logitech For Business{color}{color:#222222}{color}\n\n\n\n{color:#666666}p:{color} {color:#666666}+1-510-713-5576  <tel:+1-510-713-5576>| m:{color} {color:#666666}+1-925-750-4220 <tel:+1-925-750-4220>{color}\n\n{color:#666666}California, USA{color}{color:#666666}{color}\n\n[{color:#666666}Website{color}|https://www.logitech.com/en-us/business.html]{color:#666666}{color} {color:#999999}||{color}{color:#00b8fc}{color}{color:#666666}{color} [{color:#666666}LinkedIn{color}|https://www.linkedin.com/showcase/logitech-business/]{color:#666666} ||{color} [{color:#666666}Twitter{color}|https://twitter.com/LogitechBiz?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor]{color:#666666}{color}\n\n{color:#666666}Looking for support? Visit our{color} [{color:#666666}Help Center{color}|https://sync.logitech.com/hub/support]{color:#666666} or open a ticket{color} [{color:#666666}here{color}|https://sync.logitech.com/hub/contact-support]{color:#666666}{color}\n\n{color:#666666}Interested in our premium support? Check out{color} [Logitech Select|https://www.logitech.com/en-us/products/video-conferencing/room-solutions/select-comprehensive-service-plan.html]\n\n!https://info.logitech.com/rs/201-WGH-889/images/NPI-eSigBanners-2502_533x133-RB65-eSig.gif?version=0! <[https://www.logitech.com/en-us/products/video-conferencing/room-solutions/rally-board-65.960-001697.html?utm_campaign=_FY25Q4_SS_Email_Banner_Signature_RB65_NON_&utm_source=Internal&utm_medium=email]>\n!https://info.logitech.com/rs/201-WGH-889/images/NPI-eSigBanners-2502_533x133-Spot-eSig.jpg?version=0! <[https://www.logitech.com/en-us/products/video-conferencing/accessories/spot-sensor.950-000107.html?utm_campaign=B2B_FY25Q4_SS_Email_Banner_Signature_Spot_NON_&utm_source=Internal&utm_medium=email]>\n",
//             "status": "Pending",
//             "priority": "Critical",
//             "type": "Bug",
//             "assignee": "sjohnson4",
//             "assigneeName": "Shannon Johnson",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Cody Crawford",
//             "storyPoints": null,
//             "labels": [
//                 "SFCASE_471543402",
//                 "split_Oppotunity"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-10-10T04:16:00+05:30",
//             "updated": "2025-12-17T23:20:16+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2309333",
//             "key": "SFQTC-1009",
//             "projectKey": "sfqtc",
//             "summary": "Impartner - Default term[3 Years] for service attach products",
//             "description": "*[Service Auto Attach BRD|https://docs.google.com/document/d/1oHqWxPXeafJ_bjK2x_JJpd8C5OXJkVxAOgoQtD4OWi0/edit?tab=t.0]*\r\n\r\nAs a Reseller/Disti, I want/need the ability to have default term set to [3 Years/36 months] when service products are automatically added to the quote in Partner Portal so that quoting is streamlined and adheres to defined business rules\r\n\r\n[Product and Attached Services Mapping|https://docs.google.com/spreadsheets/d/1vHsygtN2uDPqscG15AS8gy6wgiJf0oFe/edit?gid=927040212#gid=927040212]\r\n\r\n*Tech Notes* :\u00A0\r\n * When showing a Generic SKU with Term dropdown. If the dropdown has 36, pre-populate it in the dropdown.\r\n * Update Quote line Editor and allow the partners to edit the Term:\r\n ** Use the same Term dropdown and its values when adding the Generic sku while editing the Term in the quote lined editor.\r\n ** Don't allow the partner to save Term dropdown as blank value.\r\n ** Apply the same edit permission, we have for the \"Quantity\" edit to \"Term\" field.\r\n *** In-addition to the existing permission check if Pricing_Locked__c == true, if yes, make the \"Term\" readonly for that quoteline.",
//             "status": "UAT",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": "mwilcox",
//             "assigneeName": "Marra Wilcox",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": 2,
//             "labels": [
//                 "Create_Quote_ServiceAttachRule",
//                 "Impartner",
//                 "Must_Have",
//                 "Ph1A_FastFollow",
//                 "ServiceAttach"
//             ],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-10-01T04:06:39+05:30",
//             "updated": "2026-01-09T22:22:40+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2309331",
//             "key": "SFQTC-1008",
//             "projectKey": "sfqtc",
//             "summary": "Impartner - Match the service attach product quantity to SKU quantity",
//             "description": "{*}[Service Auto Attach BRD|https://docs.google.com/document/d/1oHqWxPXeafJ_bjK2x_JJpd8C5OXJkVxAOgoQtD4OWi0/edit?tab=t.0]{*}{*}{{*}}{*}{{*}}\r\n\r\n*As a* Reseller/Disti, *I want* to set the quantity of the attached services SKUs that's automatically added to the quote in Partner Portal to automatically default to the quantity of the covered product so that quoting of attached services can be streamlined for the seller.\r\n\r\nSamples Scenarios:\r\n * AC#4\r\n ** Original Quote:\r\n *** Camera SKU 1: 10\r\n *** Service SKU 1:\u00A0-10-\u00A0-> 5\r\n ** Updated Quote:\r\n *** Camera SKU 1:{-}10{-}\u00A0->15\r\n *** Service SKU 1: 5\r\n * AC#6\r\n ** Original Quote:\r\n *** Camera SKU 1: 10\r\n *** Service SKU 1:\u00A0-10-\u00A0-> 5\r\n ** Updated Quote:\r\n *** Camera SKU 1: 10\r\n *** Camera SKU 2: 5\r\n *** Service SKU 1: 5+5 -> 10\r\n\r\n+*Note:*+\r\n\r\nAttached Services will first appear in Edit Quote view after product has been added to cart and saved to quote.\r\n\r\n\u00A0\r\n\r\n*Tech Design:*\r\n\r\nAs long as the below information is sent in the place sales transaction api (when adding/removing/changing quantity) and SF advanced configuration rules will run and add the appropriate service sku for the hardware sku added/updated. After successful post, if the quote line editor is refreshed, we will start seeing the attached services SKUs in the line editor:\r\n\r\n\"configurationMethod\": \"System\",\r\n\r\n\u00A0\u00A0\u00A0\u00A0\"configurationOptions\":\r\n\r\n{ \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\"validateProductCatalog\": true, \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\"executeConfigurationRules\": true, \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\"addDefaultConfiguration\": true \u00A0\u00A0\u00A0\u00A0}\r\n\r\n\u00A0\r\n\r\n\u00A0",
//             "status": "Ready for QA",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": "gprasath1",
//             "assigneeName": "Gowtham Prasath",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [
//                 "Create_Quote_ServiceAttachRule",
//                 "Impartner",
//                 "Must_Have",
//                 "Ph1A_FastFollow",
//                 "ServiceAttach"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-10-01T03:58:02+05:30",
//             "updated": "2026-01-21T04:00:05+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2309328",
//             "key": "SFQTC-1007",
//             "projectKey": "sfqtc",
//             "summary": "Impartner - Automatically add the Service attach products",
//             "description": "*[Service Auto Attach BRD|https://docs.google.com/document/d/1oHqWxPXeafJ_bjK2x_JJpd8C5OXJkVxAOgoQtD4OWi0/edit?tab=t.0]*\r\n\r\nAs a Reseller/Disti, I want the ability to automatically add attached services to a quote when Products with attached services are added to a quote so the quoting process is streamlined and adheres to defined business rules\r\n\r\n+*Note:*+\r\n\r\nAttached Services will first appear in Edit Quote view after product has been added to cart *and* saved to quote\r\n\r\n+*Service Attach Products:*+\r\n\r\n[Product and Attached Services Mapping|https://docs.google.com/spreadsheets/d/1vHsygtN2uDPqscG15AS8gy6wgiJf0oFe/edit?gid=927040212#gid=927040212]\r\n\r\n*Tech Design:*\r\n\r\nSame as SFQTC-1008",
//             "status": "Ready for QA",
//             "priority": "Critical",
//             "type": "Story",
//             "assignee": "gprasath1",
//             "assigneeName": "Gowtham Prasath",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": 1,
//             "labels": [
//                 "Impartner",
//                 "Must_Have",
//                 "Ph1A_FastFollow",
//                 "ServiceAttach"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-10-01T03:52:16+05:30",
//             "updated": "2026-01-21T04:04:14+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2293859",
//             "key": "SFQTC-801",
//             "projectKey": "sfqtc",
//             "summary": "Placeholder for all tickets related to Ferrero launch",
//             "description": "h2. [[Requirement Document]|https://docs.google.com/document/d/1htn_yZkzD7xz2uqfie07Nl_x20B6BNd4bxoYj2W2Hb8/edit?tab=t.0]\r\nh2. Purpose:\u00A0\r\n\r\nThe goal of Phase 1B is to implement a comprehensive asset and contract management solution globally, ensuring consistency, transparency, and control across all regions.\r\n\r\nThe North America (NAM) region will have enhanced functionality across\u00A0\r\n * *CoTermination Enablement:* Ability to align multiple contracts to a single expiration date, simplifying management for both customers and internal teams.\r\n * \u00A0*Renewal Management:* Automated and streamlined renewal processes that reduce manual intervention.\r\n * {*}Consolidation{*}: consolidate of multiple subscriptions or contracts into a single contract to reduce complexity for customers managing multiple services or products.\r\n * {*}Trials{*}: Launching a systematic process for sellers to enable select trials in the NAM region.\u00A0\r\n\r\nPhase 1B will create a robust foundation for future expansions into additional regions.\u00A0\r\n\r\n\u00A0\r\nh2. Project Scope\r\n\r\n*In Scope:*\u00A0\r\n * Global Deployment of Asset and Contract Management to ensure consistency , transparency and control at global scale.\u00A0\r\n * Cotermination: Ability to align multiple contracts to a single expiration date, simplifying management for both customers and internal teams for NAM region only\r\n * Renewal Management: Automating and optimizing the renewal processes to reduce manual effort and improve customer retention for NAM region only\r\n * Consolidation: Simplifying management by consolidating multiple subscriptions into a single contract for NAM region only\r\n * Trials Enablement: Supporting seamless product trials with tracking for conversions for Select products for NAM region only.\r\n * ferrero SKU implementation and enablement for NAM region only.\u00A0\r\n\r\n*Out of scope:*\u00A0\r\n * Renewal and Cotermination beyond the NAM region.\u00A0",
//             "status": "Waiting for Triage",
//             "priority": "Critical",
//             "type": "Epic",
//             "assignee": "rsampathkumar",
//             "assigneeName": "Ramya Sampathkumar",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=19008",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-09-11T01:09:53+05:30",
//             "updated": "2025-11-04T10:42:39+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2408337",
//             "key": "SFQTC-1412",
//             "projectKey": "sfqtc",
//             "summary": "Issue:  Opportunity Cloning is failing due to inactive contact role",
//             "description": "When we clone the opportunity with inactive contact role, opportunity is not getting cloned, we are getting below error message at last after quote selection and proceeding further\r\nThe process failed with the following error:\r\nError during cloning process: Insert failed. First exception on row 0; first error: FIELD_CUSTOM_VALIDATION_EXCEPTION, Cannot add inactive contacts to contact roles: []\r\n\r\nIdeally as per 1109 with inactive contact role w should be able to clone the opportunity.\r\n\r\nIn the below opportunity Test contact role is the inactive contact role\u00A0\r\n\r\nTest data:\u00A0\r\n[https://logitechsales--uat.sandbox.lightning.force.com/lightning/r/Opportunity/006Oy00000VORDdIAP/view]\r\n\r\n\u00A0",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "aa3",
//             "assigneeName": "Anand A",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Lallu Prasad Chowdary",
//             "storyPoints": null,
//             "labels": [
//                 "QABugs_QTC"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-29T14:55:03+05:30",
//             "updated": "2026-01-29T15:05:22+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2407802",
//             "key": "SFQTC-1410",
//             "projectKey": "sfqtc",
//             "summary": "Bulk Child Opportunity Operation",
//             "description": "As a seller, I want to be able to bulk update my child opportunities, so that I can complete my split management in a speedy fashion.\r\n * Mass close out previous open child opportunities\r\n ** Closed reason set to data correction\r\n * Mass update reseller for open child opportunities\r\n ** Replace reseller on open child opportunity with another reseller\r\n\r\nOpen Question:\r\n\r\n- What are the UX requirements on how to initiate bulk updates\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-29T03:14:51+05:30",
//             "updated": "2026-01-29T12:58:00+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2407561",
//             "key": "SFQTC-1408",
//             "projectKey": "sfqtc",
//             "summary": "Issue: Opportunity creation is failing due to inactive disti quote admins ",
//             "description": "When we create a new opportunity in SF by selecting Primary and Secondary Disti Accounts (Which have inactive quote admins) and without selecting any quote admins in opportunity creation page and save it, we are getting error message related to inactive primary disti quote admin and inactive secondary disti quote admins.\r\nOpportunity is not getting created\r\n\r\nWhen discussed with Praveen/David - they confirmed that : Opportunity creation should work as usual, if the quote admin is inactive and on the created opportunity Quote admin contact will be blank if the quote admin are inactive.",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "aa3",
//             "assigneeName": "Anand A",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Lallu Prasad Chowdary",
//             "storyPoints": null,
//             "labels": [
//                 "QABugs_QTC"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-28T21:18:50+05:30",
//             "updated": "2026-01-28T21:21:52+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2407274",
//             "key": "SFQTC-1406",
//             "projectKey": "sfqtc",
//             "summary": "Issue: Whenever cloning of the opportunity fails due to inactive primary/secondary disti quote admins or inactive reseller contacts  we are not getting required error message displayed",
//             "description": "When we clone the opportunity with an *inactive primary/Secondary disti quote admin contacts or inactive reseller contacts* cloning is not happening it fails as expected but we are not getting primary/secondary disti admin error messages instead getting message as below:\r\nError message displayed currently-\r\n*\"The process failed with the following error:\"*\r\n\r\n*There is no error message displayed stating clone has failed due to this reason please check that*\r\n\r\nExpected - Clone has failed and below error messages:\r\nExpected Error messages:\u00A0\r\nMessage for Primary Disti Contacts: The selected Primary Distributor Quote Admin in inactive. Please update the correct Primary Quote Admin contact to proceed.\r\nMessage for Secondary Disti Contact: The selected Secondary Distributor Quote Admin in inactive. Please update the correct Secondary Quote Admin contact to proceed.\r\n\r\nTest data : [https://logitechsales--uat.sandbox.lightning.force.com/lightning/r/Opportunity/006Oy00000VbTCTIA3/view]",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "aa3",
//             "assigneeName": "Anand A",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Lallu Prasad Chowdary",
//             "storyPoints": null,
//             "labels": [
//                 "QABugs_QTC"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-28T16:56:54+05:30",
//             "updated": "2026-01-28T19:31:50+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2404921",
//             "key": "SFQTC-1403",
//             "projectKey": "sfqtc",
//             "summary": "Revise and Reprice",
//             "description": "Epic to house revision and repricing operations",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Epic",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-26T22:23:55+05:30",
//             "updated": "2026-01-28T12:03:20+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2403509",
//             "key": "SFQTC-1399",
//             "projectKey": "sfqtc",
//             "summary": "New Quote Status (Committed, In Revision)",
//             "description": "Recent discussions to identify which quotes to update for MSRP pricing changes had shown issue in identifying quotes which a commitment letter was generated. Under current status, quote can either be in approved and draft status with an active offer. Requirement to introduce new quote status of Committed and In Revision\r\n\r\nFollowing definition for status\r\n * Committed - Approved quote and commitment letter generated\r\n ** To support future state where quote approval does not automatically lead to commitment letter generation\r\n * In Revision - When commited quote is being revised\r\n ** To support future revise and reprice operations\r\n ** If revision is abandoned, quote should revert back to committed status with edits undone\r\n\r\nTicket to include a one time data update on current quotes. Logic to be applied for update:\r\n * If quote is in \"Approved\" and Offer is \"Active\": Update Quote status to \"Committed\"\r\n * If quote is in \"Draft\" and Offer is \"Active\": Update Quote status to \"In Revision\"",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": "akatragadda",
//             "assigneeName": "Anjali Katragadda",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-23T22:32:12+05:30",
//             "updated": "2026-01-28T02:03:03+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2402508",
//             "key": "SFQTC-1396",
//             "projectKey": "sfqtc",
//             "summary": "Deal Expiration Date not updated upon Deal Extension Request Approval",
//             "description": "Steps:\r\n # Login as Global Admin\r\n # Navigate to a DR Opportunity and update the Deal Expiration Date to current week in the future for testing purpose\r\n # Login as the Partner and navigate to the Deal and submit an extension request\r\n # Login to SFDC as the request Approver and approve the Deal Extension Request\u00A0\r\n # Observe the Deal Expiration Date not updated upon Deal Extension Request Approval\r\n\r\nTest Record: https://logitechsales–uat.sandbox.lightning.force.com/lightning/r/Opportunity/006Oy00000VQqdpIAD/view\r\n\r\n\u00A0",
//             "status": "Ready for QA",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "dsunkara",
//             "assigneeName": "Dileep Sunkara",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Dileep Sunkara",
//             "storyPoints": 0,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-22T22:43:54+05:30",
//             "updated": "2026-01-28T20:23:33+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2401765",
//             "key": "SFQTC-1390",
//             "projectKey": "sfqtc",
//             "summary": "Valid contact emails are bounced",
//             "description": "We have contacts whose emails bounce even though email addresses are valid. To fix this issue temporarily, workaround that we are following currently is updating the email address to invalid email address and then saving it back with a valid email address. After this action, email deliverability works.",
//             "status": "In Progress",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "mraheja1",
//             "assigneeName": "Megha Raheja",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Megha Raheja",
//             "storyPoints": null,
//             "labels": [
//                 "SFCase_472488956"
//             ],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-22T08:27:21+05:30",
//             "updated": "2026-01-22T08:30:06+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2390604",
//             "key": "SFQTC-1355",
//             "projectKey": "sfqtc",
//             "summary": "Alliances cant see Line items in the Quote line items tab.",
//             "description": "Hi,\r\n\r\nDanielle Que has the Alliance permission but cannot see  Line items in the Quote line items tab.\r\n\r\n !image-2026-01-09-21-28-20-201.png|thumbnail! \r\n\r\nRegards,\r\nSushma",
//             "status": "In Progress",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "akatragadda",
//             "assigneeName": "Anjali Katragadda",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Sushma Menezes",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-09T21:29:33+05:30",
//             "updated": "2026-01-09T21:33:19+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2389573",
//             "key": "SFQTC-1349",
//             "projectKey": "sfqtc",
//             "summary": "Quote Revision for Split Opportunity (Scenario 4 and 5)",
//             "description": "For quantity removal\r\n * Seller wants the ability to identify a QLI as no longer available and communicate this to T1\r\n * QLI no longer available for purchase should not cause errors during split wizard operations\r\n * QLI unallocated amount should be set to zero\r\n\r\n\u00A0\r\n\r\nClarification questions\r\n * \u00A0\r\n\r\n\u00A0\r\n\r\n[https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3ae819fd1db_0_61#slide=id.g3ae819fd1db_0_61]\r\n\r\nNotes - \r\nFrom implementation perspective same as Scenario 2. \r\nExplicitly check Add/Remove product workflow and how that works even if same synched quote but now removing some products from synced quote but original child opportunities have some allocations for these products.",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-08T23:30:35+05:30",
//             "updated": "2026-01-14T01:16:11+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2389566",
//             "key": "SFQTC-1348",
//             "projectKey": "sfqtc",
//             "summary": "Scenario 2: Multiple approved quotes for multiple resellers",
//             "description": "As a seller, I want to be able to have different resellers identified for my child opportunities in a split opportunity so that I can better manage my opportunity forecast\r\n\r\nRequirements:\r\n * A forecasting quote would be created and synced to the opportunity\r\n ** Forecasting quote will does not need to be approved\r\n * When splitting, only resellers with an approved quote will be sellectable as a reseller for a child opportunity\r\n * Each child opportunity will have 1 reseller\r\n * Split wizard will show the BOM of the forecasting quote and allocate the quantity to each child opportunity\r\n\r\n[https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3b051b057b8_0_245#slide=id.g3b051b057b8_0_245]\r\n[https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g36a25176463_0_1029#slide=id.g36a25176463_0_1029]\r\n\r\n*Tech Design:*\r\n\r\n1) Show \"Reseller\" dropdown in Opportunity child grid UI\r\n\r\n1.1) Query for Reseller : Get all Preferred Reseller of all quotes under the Opportunity. Make sure reseller contact is maintained for the reseller account.\r\n\r\n2) Reseller should be selectable only on open opportunity\r\n\r\n3) Save the \"Reseller\" selection in Opportunity following fields:\u00A0\r\n\r\nPartner_Account_AMR__c\r\n\r\nPreferred_Reseller_Contact__c",
//             "status": "Design Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": "pp1",
//             "assigneeName": "Praveen P",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14925",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-08T23:27:06+05:30",
//             "updated": "2026-01-29T12:56:24+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2389557",
//             "key": "SFQTC-1346",
//             "projectKey": "sfqtc",
//             "summary": "Placeholder for Split Opportunity - Future State ",
//             "description": "[BRD|https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?usp=sharing]\r\n\r\nMain problems trying to address with future process - [Slide 13|https://docs.google.com/presentation/d/1PuEF9jb3OKPCM-zrM8hpCG1Xv53RENNXK6s-keJf0TI/edit?slide=id.g3a73c57a8e5_0_0#slide=id.g3a73c57a8e5_0_0]\r\n* Sellers should be able to create splits quantities of 0 if they want to remove that product from the deal. It shouldn’t force a negative number on there. (Current validation rules don’t allow this) \r\n* Seller should be able to select the Reseller from Approved Quote in the Split Screen. If multiple reseller are closing in a quarter/month, then multiple splits are performed with same close date but different reseller selected\r\n* Upon selection of reseller and other attributes, system should create opportunity with corresponding quantity, reseller selected\r\n* Split distributions can be modified until the opportunity is closed won/lost\r\n--\r\nSync/unsync of quote should be supported even after Split started \r\n\r\n\r\n\r\n",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Epic",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-08T23:06:50+05:30",
//             "updated": "2026-01-29T12:36:20+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2388378",
//             "key": "SFQTC-1340",
//             "projectKey": "sfqtc",
//             "summary": "Cost book Integration Enhancements",
//             "description": "# Create ITSM ticket if there are any failures occur in cost book sync:\r\n ## <fill Jira creation details>\r\n # Only send only inventory orgs of active costbooks.\r\n # Check why lastmodifiedate is changed for NAM-CAD Costbook entries even though price is not changed\r\n # Add following details in the Cost book table and update it accordingly:\r\n ## Last Sync Date : <DateTime>\r\n ## Success Count : <Number>\r\n ## Error Count : <Number>\r\n # Add support for refreshing individual CBE cost :\u00A0\r\n ## To refresh individual CBE cost, use the below api call :\u00A0\r\n{code:java}\r\n{ \u00A0 \"orgs\": [ { \"id\" : \"<inventory_org>\", \"items\": [\"string\"] //productcodes if individual CBE needs to be refreshed }\u00A0 \u00A0 \u00A0 \u00A0 ] \u00A0 }{code}\r\n2. Don't update the costbook's last sync date field : if the cost book sync for individual product sync. Check if \"items\" in the v1/Costbooksync has value. if yes, don't update the costbook's last sync date field.",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Enhancement",
//             "assignee": "rsampathkumar",
//             "assigneeName": "Ramya Sampathkumar",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=19008",
//             "reporter": "Praveen P",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-07T21:18:26+05:30",
//             "updated": "2026-01-21T15:24:14+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2384173",
//             "key": "SFQTC-1332",
//             "projectKey": "sfqtc",
//             "summary": "EU-Approval Email Templates",
//             "description": "*User Story Description:*\r\n\r\nAs a system, approval email should be send out to the approver with the template defined below, when the quote is submitted for approval.\r\n\r\n*Acceptance Criteria:*\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2026-01-02T20:33:19+05:30",
//             "updated": "2026-01-06T00:56:19+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2382502",
//             "key": "SFQTC-1341",
//             "projectKey": "sfqtc",
//             "summary": "Offer Creation Failed",
//             "description": "Offer creation failed due to the following reason - Collection is empty\n\nQuote - https://logitechsales.my.salesforce.com/0Q0Pb00000UeyfJKAR\nOpportunity - https://logitechsales.my.salesforce.com/006Pb00000qFVS9IAO",
//             "status": "Pending",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "sjohnson4",
//             "assigneeName": "Shannon Johnson",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "crm-sales-jirauser",
//             "storyPoints": null,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-31T01:51:51+05:30",
//             "updated": "2026-01-08T10:09:19+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2382293",
//             "key": "SFQTC-1329",
//             "projectKey": "sfqtc",
//             "summary": "Issue : Disti is able to submit the deal on behalf of Reseller/Partner who is disabled to submit the DR(disabled partner track)",
//             "description": "Disti is able to submit/register a deal on behalf of reseller/partner who is disabled to submit the DR, whose specific partner track(s) in specific country(s) is set to not be able to DR/SPA.\r\nAs per 891 AC4: Disti should not be able to submit the DR/SPA for partners, when specific partner track(s) in specific country(s) is set to not be able to DR/SPA.\r\n\r\nUnified communications : Partner Account with track= Elite, Country=USA - whose specific partner track(s) in specific country(s) is set to not be able to DR/SPA\r\nDisti - Ingram Micro US\u00A0\r\n\r\nTest data :\u00A0\r\n\r\nDistributor (Ingram Micro US) is able to submit the deal on behalf of partner/reseller Unified communications\r\nDisti : [https://stage.impartner.live/en/members/addOrUpdate.aspx?id=4022125]\r\nReseller contact : [https://stage.impartner.live/en/members/addOrUpdate.aspx?id=4044273]\r\n\r\nDisti : Adam Ruda - lchowdary+adamrudatestdisticontact@logitech.com\u00A0\r\nReseller Contact : Alejandro Carrero - lchowdary+alejandrocarrerotestcontact@logitech.com \u00A0\r\n\r\n*Tech Design:*\r\n{code:java}\r\nMain Query : SELECT Id, Name, Email,Account.BillingCountry,Account.BillingState, Account.BillingCity,AccountId\r\nFROM Contact\r\nWHERE email = '<email_id>' and Account.BillingCountry = '<country>' and Partner_External_Id__c != null and Account.RecordType.DeveloperName = 'Partner_Account' and Account.B2B_Region__c = 'NAM' and Account.Type IN ('Value Added Reseller', 'OEM') and Inactive__c = false and Allow_Deal_Registration__c = true\r\n\r\n\r\nSuggested Result Query : SELECT Id,Name,Email,Account.BillingCountry, Account.BillingState, Account.BillingCity, AccountId From Contact WHERE Email like '%@<email_domain>' and Account.BillingCountry = '<country>' and Partner_External_Id__c != null and Account.RecordType.DeveloperName = 'Partner_Account' and Admininstrative_Privileges__c includes ('Opportunity Administrator') and Last_Login__c != null and Account.B2B_Region__c = ‘NAM’ and Account.Type IN ('Value Added Reseller', 'OEM') and Inactive__c = false and and Allow_Deal_Registration__c = true ORDER By Last_Login__c DESC LIMIT 1{code}",
//             "status": "Development Backlog",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "jkakarala",
//             "assigneeName": "Jaya Krishna Kakarala",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Lallu Prasad Chowdary",
//             "storyPoints": null,
//             "labels": [
//                 "ImpartnerCase-74993",
//                 "QABugs_QTC"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T19:45:13+05:30",
//             "updated": "2026-01-20T17:49:26+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381748",
//             "key": "SFQTC-1327",
//             "projectKey": "sfqtc",
//             "summary": "EU-Sending Offer Details to Oracle",
//             "description": "*User Story Description:*\r\n\r\nAs a system, discount information will be separated into PLA Amount and Promo Amount when sending the offer details to Oracle so that the accurate discounting information can be stored for reporting purposes.\r\n\r\n*Acceptance Criteria:*\r\n\r\nWhen sending offer code details to Oracle, the discount information shall be separated into PLA Amount and Promo Amount.\u00A0\r\n<Formula? Are the values converted from quote currency to offer currency? >",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:24:45+05:30",
//             "updated": "2026-01-02T22:05:18+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381747",
//             "key": "SFQTC-1326",
//             "projectKey": "sfqtc",
//             "summary": "EU-Commitment Letter Template",
//             "description": null,
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:23:43+05:30",
//             "updated": "2026-01-02T22:02:48+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381746",
//             "key": "SFQTC-1325",
//             "projectKey": "sfqtc",
//             "summary": "EU-Offer Generation Process for DR and SPA Quotes",
//             "description": "*User Story Description:*\r\n\r\nAs a system, offer code should be generated automatically for DR Quotes and either manually or automatically for SPA Quotes once the quote is approved.\r\n\r\n*Acceptance Criteria*\r\n\r\n*Quote Creation Currency:*\r\nThe quote must be generated in the currency selected by the reseller, distributor, or seller.\r\nFor DR Quotes, upon quote approval, the system shall automatically trigger offer code creation in Oracle.\r\nFor SPA Quotes, sellers may choose to auto-generate the offer code or initiate creation manually. Depending on this selection, the system will trigger offer code creation in Oracle.\u00A0\r\n*Offer Currency Conversion:*\r\nOnce the quote is approved and before Offer code creation, all relevant price elements on the offer—such as MSRP, STP, Discount per unit, PLA, Promo discount, and Net distributor price—must be converted to the corresponding T1 distributor’s mapped Oracle currency.\r\n*FX Rate Application and Recording:*\r\nThe specific FX rate used for this currency conversion must be recorded (stamped) on the offer record.\r\nThis FX rate information will not be included in Commitment Letters.\r\n*Consistency for Quote Modifications:*\r\nIf any modifications are made to existing quote lines, the original FX rate stamped on the offer should continue to be used for all further price calculations.",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:23:00+05:30",
//             "updated": "2026-01-02T22:01:17+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381745",
//             "key": "SFQTC-1324",
//             "projectKey": "sfqtc",
//             "summary": "EU-Quote Revision Logic",
//             "description": "*User Story Description:*\r\n\r\nAs a user, I should be allowed to revise Quote in Salesforce once the quote has been approved so that I can make the changes to the existing quote lines and add new quote lines to the quote.\r\n\r\n*Acceptance Criteria:*\r\n\r\n1) Once a quote is approved, the system shall lock the T1 unit net price for all existing quote lines and Fx rate leveraged.\r\n2) Resellers or sales representatives shall be able to revise an approved quote by selecting “Revise Quote” in the Salesforce.\r\n3) Distributors may revise quotes only if they originally created the quote; otherwise, changes must be coordinated with the reseller.\r\n4) When a quote is revised:\r\n * The pricing (MSRP, unit net price, fx rate and discounts) for existing lines shall remain unchanged, regardless of updates to quantity or the deletion of lines, as these lines are price locked.\r\n * Adding a new line will use the latest MSRP, STP, distributor pricing, and current discount rules to determine the price for the new line item.\r\n * Users may update the quantity of locked lines without affecting their price and proceed to submit the revised quote for approval.\r\n\r\n5) Upon approval of the revision, the offer code shall be updated to reflect the new Bill of Material (BOM) but the offer code itself will remain the same; only its version will increment.\r\n6) For quote revisions the updated offer codes for both DR and SPA quote, will be sent immediately after quote approval and does not depend on “Auto Generate offer code” flag.\u00A0\r\n7) After approval, the system shall send the updated offer code version to the distributor, maintaining the original offer code number.\r\n\r\n*NOTES:*\r\n\r\nLeverage the same Fx rate from the initial approval, for the existing lines or price locked items\r\nNew lines will leverage the new FX rate.\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:22:20+05:30",
//             "updated": "2026-01-02T21:58:09+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381744",
//             "key": "SFQTC-1323",
//             "projectKey": "sfqtc",
//             "summary": " EU-DR and SPA Extension Logic",
//             "description": "*Acceptance Criteria:*\r\n\r\nDR & SPA Extension Requests: Resellers can request extensions at Quote level via the Partner Portal up to 21 days before expiration.\r\n\r\n\r\n*SPA Extensions:*\r\nIf MSRP prices have not changed, the approval goes directly to the Sales Rep for their approval.\r\nIf MSRP prices have changed, the request will be rejected.\r\n\r\n\r\n*DR Extensions:*\r\nIf MSRP prices have not changed, the request will be auto-approved.\r\nIf MSRP prices have changed, the request will be rejected.\r\n\r\n\r\n*Maximum Terms:*\r\nSPA: 90 days (initial term) + 60 days + 60 days + 60 days (Total 270 days)\r\nDR: 90 days (initial term) + 90 days + 60 days + 60 days (Total 300 days)\r\nEU Suggested Terms\r\nSPA: 180 days (initial term) + 90 days + 90 days (Total 360 days)\r\nDR:90 days (initial term) + 90 days + 90 days + 90 days (Total 360 days)\r\nNotification of DR & SPA Extension: Resellers, distributors, and sales representatives will receive a notification 21 days prior to the expiration of their DR/SPA terms.",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:21:21+05:30",
//             "updated": "2026-01-02T21:21:35+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381742",
//             "key": "SFQTC-1322",
//             "projectKey": "sfqtc",
//             "summary": "EU-Price Conversion for Approvals",
//             "description": "*User Story Description:*\r\n\r\nAs a user when I submit a quote for approval, system should be able to apply the price conversion for COGS, Deal Margin and Deal Size as per the acceptance criteria below.\r\n\r\n*Acceptance Criteria:*\r\n\r\n1) For EU based on the pricebook/currency selected by the disti / reseller, the system will create a quote in the corresponding currency.\r\n\r\n2)\u00A0{*}COGS{*}: For the EU, COGS information is available in Oracle in Euros. This value will need to be converted to USD and GBP based on Quote currency.\u00A0\r\n * COGS information is stamped for each line item when the product is added to the quote. [The COGS will change at time of quote approval submission due to a different Fx rate at time of submission. ]\r\n * Fx rate leveraged for all conversions should be stamped on the quote for SOX process and future quote revisions.\u00A0\r\n * Other pricing elements will be on currency selected by the user only.\u00A0\r\n\r\n3)\u00A0*Deal Margin:* Deal margin and other pricing attributes that determine approval triggers will initially be calculated in the currency selected by the user.\u00A0\r\n * Deal Margin: Deal margin can be computed using the quote currency values. No conversion needed. However the COGS needs to be converted to the corresponding quote currency.\u00A0\r\n\r\n4)\u00A0{*}Deal Size{*}: All the approval thresholds for all countries are set up in corporate currency (USD). Similar structure has to be maintained for Canada too.\u00A0\r\n * The overall quote deal size should be converted to USD and then compared to the approval thresholds to identify the appropriate approvers.\u00A0\r\n\r\n5) Similar to NAM, all the approval threshold matrix values should be available for SOX reporting.",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:20:40+05:30",
//             "updated": "2026-01-02T21:15:45+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381741",
//             "key": "SFQTC-1321",
//             "projectKey": "sfqtc",
//             "summary": "EU-Deal Margin Enhancements to include Rebate Amount ",
//             "description": "*User Story Description*\r\n\r\nAs a user when I submit a quote for approval, it should be evaluated against Deal Margin + Rebate Amount in the approval matrix and not just the Deal Margin.\u00A0\r\n\r\n*Acceptance Criteria*\r\n\r\nCurrently approval matrix logic for NAM refers to Deal margin.\r\n\r\nFor EU, approval matrix logic should refer to *Deal Margin + Rebate Amount.*\u00A0For NAM Rebate Amount would be 0.\r\n\r\nHow rebate amount is calculated for different partners->Logic to be defined/TBD",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:20:11+05:30",
//             "updated": "2026-01-02T21:04:38+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381740",
//             "key": "SFQTC-1320",
//             "projectKey": "sfqtc",
//             "summary": "EU-Non Standard Deal Logic and Verbiage Display",
//             "description": "*User Story Description:*\r\n\r\nAs a approver I should be able to see Non Standard Deal messaging on the approval email template.\r\n\r\n*Acceptance Criteria:*\r\n\r\n1) Non Standard Deal Identification Criteria-TBD\r\n\r\n2) On Approval email template, a verbiage should be added 'This is a Non Standard Deal' in Bold and red. <Verbiage to be confirmed>\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:19:33+05:30",
//             "updated": "2026-01-02T20:42:31+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381739",
//             "key": "SFQTC-1319",
//             "projectKey": "sfqtc",
//             "summary": "EU-Approval Matrix Logic",
//             "description": "*User Story Description:*\r\n\r\nAs a system, quote should be triggered for approval or auto approved depending on the deal type and quote matrix parameters as defined below in the acceptance criteria.\r\n\r\n*Acceptance Criteria:*\r\n\r\n1) Sales rep should be able to capture justification for additional discounts before submitting quote for approval.\r\n\r\n!image-2026-01-02-09-58-48-010.png!\r\n\r\n2) *Deal Registration (DR) Quotes:*\r\n * When a DR lead is converted into an Opportunity, the associated quote is automatically attached.\r\n * The quote is then auto-approved by the system without additional checks.\r\n\r\n3)\u00A0*Special Pricing Agreement (SPA) Quotes:*\r\n * If a SPA quote contains only programmatic (pre-approved) discounts, with no incremental discount on any line item, the system will automatically approve the quote.\r\n * However, if any quote line includes an incremental discount, the system initiates an approval workflow.\r\n\r\n * Approvals are determined by both overall deal margin and the margin for individual SKUs.\r\n * If the overall deal margin meets required criteria, but a specific product is heavily discounted, the system triggers SKU margin approval for that particular line. This ensures that deeply discounted items are reviewed by the product category team.\r\n\r\n * *Overall Deal Margin:*\r\n * Approval routing depends on following attributes\r\n * Country\r\n * Overall Deal margin\r\n * Deal type (e.g., VC Only, PWS Only, Tablet Only, Blended Deal)\r\n * Deal Size (MSRP Excl. VAT)\r\n\r\n * The system directs approvals to relevant approvers based on these parameters defined.\r\n\r\n * *SKU-Specific Margin:*\r\n * For each SKU, the system checks for incremental discounts.\r\n * If no incremental discount is present, SKU margin approvals are skipped.\r\n * If there is an incremental discount, the system compares the SKU margin to regional or global thresholds.\r\n * If the margin is below the designated threshold, approval is required from the corresponding product category team.\r\n * If the margin meets or exceeds threshold criteria, SKU margin approval is bypassed.\r\n\r\n!image-2026-01-02-10-01-29-616.png!\r\n\r\n\u00A0\r\n\r\n4)\u00A0*Approvers*\r\n * Quotes shall be routed to the appropriate approvers according to predefined approval thresholds.\r\n * Approvers shall receive email notifications when a quote is pending their approval. Approvers should be able to approve the quote via email. [Email template covered in another user story SFQTC-1332]\r\n * All approvers at the same approval level must be able to review and approve the quote concurrently before it advances to the next approval level, if required.\r\n * Approvers shall be able to log into Salesforce to view full quote details, quote line items, and the justification provided by the sales representative for any requested additional discount.\r\n * Deal margin and COGS information, both at the overall deal and individual line item level, shall be accessible to approvers but remain hidden from sales representatives.\r\n * Approvers must have the ability to approve or reject the quote and provide comments during their review.\r\n * If approved, the quote will progress to the next required approval level or be considered fully approved.\r\n * If rejected, the quote will return to draft status.\r\n\r\n * Sales representatives shall be able to view any comments provided by approvers during the review process.",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:18:42+05:30",
//             "updated": "2026-01-02T21:04:38+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381738",
//             "key": "SFQTC-1318",
//             "projectKey": "sfqtc",
//             "summary": "EU-Pricing Waterfall",
//             "description": "All Pricing calculations will be based off MSRP excl. VAT.\u00A0\r\n\r\n\u00A0\r\n\r\n*Example: Pricing Split on DR Deal*\r\n\r\n!image-2025-12-31-10-45-08-864.png!\r\n\r\n*Example: Pricing Split on SPA Deal*\r\n\r\n!image-2025-12-31-10-45-41-078.png!\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:13:58+05:30",
//             "updated": "2025-12-31T21:16:01+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381737",
//             "key": "SFQTC-1317",
//             "projectKey": "sfqtc",
//             "summary": " EU-Pre Approved Discount Logic",
//             "description": "Based on the deal type and T2 on the Quote, system will automatically calculate the pre-approved discounts on the quote. These pre-approved discounts are programatic discounts and would not require any additional discounts.\r\n\r\nFor computation of Total PLA Discount for Europe, we will take into account the T2 Front End Margin , Partner Program and VC Specialization discount.\r\n\r\n!image-2025-12-31-10-43-02-332.png!",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:13:39+05:30",
//             "updated": "2025-12-31T21:15:53+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381736",
//             "key": "SFQTC-1316",
//             "projectKey": "sfqtc",
//             "summary": "EU-Manual Discount Types",
//             "description": "*User Story Description:*\r\n\r\nAs a user, I should be able to provide additional manual discounts on quote by editing Discount Type field.{*}{*}\r\n\r\n*Acceptance Criteria:*\r\n\r\nDiscount type is a mechanism by which price calculations / reductions are applied to Products and Services on the Quote.\u00A0\r\n\r\nSales representatives will be able to change the Discount type at the Quote level. Based on the Discount type selected by the sales representatives, system will reprice the quote accordingly. These Discount Types are applicable for SPA Deal Type only.\u00A0\r\n\r\nThe following Discount types are in Scope for Europe.\r\n * *Discretionary Discount (Default):* This enables sales representatives to apply additional incremental discounts over the pre-approved discounts.\u00A0\r\n * {*}Pre-Approved Global Deal Pricing{*}: Based on the T3 account selected on the Quote, system will populate the approved discounts for that T3 Account as a pre-approved discount in the Quote. (GLOBAL 30).\u00A0 If the Sales representatives, wishes to provide additional discount over the Global30/pre-approved discounts then he/she can enter that as “Incremental Discount” on the Quote. The additional incremental discount would require approval.\u00A0\r\n * {*}Contract Price{*}: Legally defined prices/discounts for T3 account are applied to the Quote. These contract Prices can be defined at T2/T3 account combination i.e. a contract price is agreed when T3 buys from a specific T2 only. Seller can request for additional discount over the agreed upon Contract price, which will trigger approvals.\u00A0\r\n * *T1 Goal Seek* : Sellers have the ability to specify a target T1 price for each product within the quote. The system will then automatically back-calculate the incremental discount required, taking into account both pre-approved discounts and the desired T1 price.\r\n\r\nSpecified T1 target should not lead to negative incremental discount.\u00A0\r\n\r\n% off T3, % off T2, and T3 Goal Seek are out of Scope for Europe\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:12:43+05:30",
//             "updated": "2025-12-31T21:10:19+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381735",
//             "key": "SFQTC-1315",
//             "projectKey": "sfqtc",
//             "summary": " EU-System Discount Types",
//             "description": "*User Story Description*\r\n\r\nAs a system, system discounts should be applied to the Quote based on the discount types defined in the acceptance criteria.\r\n\r\n*Acceptance Criteria*\r\n\r\nFollowing are the type of Discounts/Margin that are in scope for Europe.\u00A0\r\n|*Discount*|*Details*|\r\n|T2 Front End Margin|Upfront T2 Discount that is provided on MSRP Excl. VAT.\u00A0|\r\n|Partner Program|Standard PLA discounts based on Product Track and Product Group/ SKU|\r\n|VC Specialization|VC specialization Discounts based on Product Track and Product Group / SKU|\r\n|Deal Registration|Additionally Deal Registration discount secured for identify new customers.\u00A0|\r\n|Quantity Discount|The quantity-based discount is calculated according to the number of products from a particular product group.|\r\n|Volume Discount or Quote Amount\u00A0|Discount applied to all the lines on the quote based on the total Quote Amount value|\r\n|Public Sector|Public Sector Discount is applied based on the T3 Account on the Quote|\r\n|Time Based Promotions|Time based promotions applied at each Product level.\u00A0|\r\n\r\n\u00A0\r\n|*Discount type*|*Attributes*|\r\n|Partner Discount|Product Group/CRM Category / SKU , Partner Track , Region, Country ,Effective Start/ End Date|\r\n|VC Specialization|Product Group/CRM Category / SKU, Partner Track, Specialization Type, Region, Country, Effective Start/ End date|\r\n|Non Discount SKU|Country , Product SKU|\r\n|Deal Registration Discount|Product Group/CRM Category\u00A0 , Partner Track, Country, Effective Start / End Date|\r\n|Deal Registration Exception|Country , Product SKU|\r\n|Quantity Discount|Country, Product Group/CRM Category , Lower Bound, Upper Bound, Effective Start/End Date|\r\n|Quote Amount Based Discount|Country, Currency, Lower Bound, Upper Bound, Effective start/End date|\r\n|Public Sector|Country, Discount, Effective Start / End Date|\r\n|Time Based Promotions|Country , Promotion Name, Product SKU, Effective start/End date|\r\n|Disti Margin|Country, Margin, Effective start /End date. Not Applicable for Europe?|\r\n|Global Account Discount|Account, Product Group/CRM Category /SKU, Effective Start/ End Date|\r\n|Contracted Price|Account (T3), Contract ID, Countries, Product Group, Product Code, Type (Price/Discount), Contracted Value, Currency, T2 Account (Optional)|",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:12:27+05:30",
//             "updated": "2025-12-31T21:04:28+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381734",
//             "key": "SFQTC-1314",
//             "projectKey": "sfqtc",
//             "summary": "EU-Quote and Opportunity Pricing Currency Requirements",
//             "description": null,
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:12:01+05:30",
//             "updated": "2025-12-31T21:04:25+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381732",
//             "key": "SFQTC-1313",
//             "projectKey": "sfqtc",
//             "summary": "EU-Pricebook Availability and Currency Options",
//             "description": "*User Story Description*\r\n\r\nAs a seller I should be able to select pricebook from the available pricelist mapped to EU region and upon selection Quote will be priced based on the pricebook selected.\r\n\r\n*Acceptance Criteria:*\r\n\r\n1) EU will have 4 pricebooks in Oracle-Euro Pricelist, USD Pricelist, GBP Pricelist and Israel USD Pricelist.\r\n\r\n2) Here is the mapping of MSRP-STP that needs to be pulled from Oracle\r\n|*User Selection*|*MSRP*|*STP*|\r\n|EURO|EMEA EUR Germany MSRP|EMEA EUR STP|\r\n|GBP|EMEA GBP UK MSRP|EMEA GBP STP|\r\n|USD|MSRP USD|EMEA USD Ukraine STP|\r\n|Israel USD|Israel USD|EMEA USD STP|\r\n\r\n*Note:* Equivalent MSRP prices for USD and Israel USD are currently not available in Oracle.\r\n\r\n3) Reseller /Disti will be able to select a pricelist from the available price list mapped to the EU region and upon selection Quote will be priced based on the pricebook selected and mapped currency only. It will NOT be converted to the local currency of the country.\u00A0\r\n\r\nPricebook for selection: Great British Pound (GBP) , Euro (EUR) , US Dollars (USD) , US Dollars - Israel (USD)\r\n\r\nThe user selects EURO as currency, then the price will be the same across all countries in Europe.\r\n\r\n4)\u00A0References MSRP and Reference VAT will be leveraged to for computation of MSRP Excl VAT in Oracle.\u00A0\r\n\r\n5) Europe will have MSRP with VAT and MSRP excl VAT prices. All the price calculations in Salesforce will be based on MSRP Excl. VAT only and the same will be displayed to the partners/ disti. Distributor Price/ Disti Invoice Price is calculated in Oracle at run time and the pricebook is not available in Oracle. SF to mimic the same calculation as Oracle.\r\n|*Country*|*Source*|\u00A0|\u00A0|\r\n|*Currency*|\u00A0|*EUR*|*GBP*|\r\n|*MSRP , incl. VAT*\u00A0|Oracle|119|109|\r\n|*Local VAT*\u00A0|Oracle|20%|20%|\r\n|*MSRP , Excl VAT*\u00A0|Oracle\u00A0|*99.17*|*90.83*|\r\n|*T2 Front end Margin*\u00A0|SF (Calculation based on STP & MSRP excl. VAT)|15%|15%|\r\n|*STP*|Oracle|*84.29*|*77.21*|\r\n|*T1 Margin (Off STP)*\u00A0|Oracle|6%|6%|\r\n|*Distributor Price*|SF (Calculation to mimic Oracle calculation)\u00A0|*79.23*|*72.58*|\r\n\r\n6) *Product Availability*\r\n * Products must be mapped to each relevant pricebook to enable quoting when a user selects a specific price list or currency.\r\n * All EU countries can access and use any of the available pricebooks (USD, EUR, or GBP) for quoting. The product price shown will match the selected pricebook/currency, regardless of the user’s country.\r\n * Once a product is tagged to a particular currency or pricebook, it becomes available for quoting in all EU countries.\r\n * There are no standard system restrictions that prevent a product from being displayed for a specific country in Europe once it is mapped to a pricebook/currency. Product availability is not filtered or blocked on a per-country basis unless custom business rules, compliance requirements, or manual restrictions have been implemented in the CPQ system.\r\n\r\n*Example:*\r\nA product assigned to the \"EMEA EUR Germany MSRP\" pricebook will be quotable by users in France, Italy, Spain, or any other EU country as long as the EUR pricebook is selected.",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:08:52+05:30",
//             "updated": "2025-12-31T20:56:09+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381731",
//             "key": "SFQTC-1312",
//             "projectKey": "sfqtc",
//             "summary": "EU-Quote Expiration Date Logic",
//             "description": "*User Story Description*\r\n\r\nAs a system, DR Quote Expiration Date and SPA Quote Expiration Date should be automatically set upon Quote Approval Date as defined in the Acceptance criteria below.\r\n\r\n*Acceptance Criteria:*\r\n\r\nInitial Quote expiration: Once DR&SPA Quote are approved, the initial logic for DR & SPA expiration would be\r\nDR Quote Expiration = Opportunity Creation Date + 90 days\u00A0\r\nSPA Quote Expiration = Approval Date + 90 days.\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:07:58+05:30",
//             "updated": "2025-12-31T20:39:33+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381730",
//             "key": "SFQTC-1311",
//             "projectKey": "sfqtc",
//             "summary": "EU-QLE Fields Display",
//             "description": "*User Story Description:*\r\n\r\nAa a seller, I should be able to see the below columns in the Quote Line Editor for the sales team review.\r\n\r\n*Acceptance Criteria:*\r\n\r\nProduct ID\r\nProduct Number\r\nMSRP ( This will be MSRP Excl. VAT)\r\nDisti Cost ( This has to be renamed to Disti Cost from Disti Cost/ STP)\u00A0\r\nQuantity\r\nRoom Size\r\nSubscription Term\r\nTotal Pre-approved Discount (%)\u00A0\r\nIncremental Discount (%)\r\nDisti Cost after Discounts\r\nReseller Cost after Discounts\r\nDiscount per unit\r\nProduct Status\r\nPrice Locked\r\n\r\nThe *discount breakdown on the right* should include the following columns for Europe.\u00A0\r\nProduct Group\u00A0\r\nT2 Front End Margin (NAM displays Partner Front End Margin while Europe displays T2 Front End Margin.)\r\nPartner Discount\r\nVC Specialization\u00A0\r\nVC Headset Specialization\r\nTotal PLA Off MSRP (%) - Can this attribute be in bold. Changes to be implemented for NAM too.\u00A0\r\nExcluded from Deal Reg Discount\r\nDeal Registration Discount\u00A0\r\nQuanitity Discount\r\nQuote Amount Based Discount\r\nPublic Sector\r\nTime Based Promotional Discount\r\nTime Based Promotional Name\r\nBest B2B Program Discount % . Can this be in bold. Changes to be implemented for NAM too.\u00A0\r\nBest B2B Program Promo Name\r\nTotal Pre-Approved Discount (%) - Can this have informational icon that says that it is sum of Total PLA and Best B2B discount. Changes to be implemented for NAM",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:07:20+05:30",
//             "updated": "2025-12-30T21:16:52+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381729",
//             "key": "SFQTC-1310",
//             "projectKey": "sfqtc",
//             "summary": "EU-Quote Cloning Logic",
//             "description": "*User Story Description:*\r\n\r\nAs a seller, I should be able to clone the Quote.\r\n\r\n*Acceptance Criteria:*\r\nSellers shall be able to clone individual quotes within an opportunity.\r\nThe cloned quote shall:\r\nClone the Bill of Material and T1, T2, T3 account information from the original quote.\r\nBe attached to the same opportunity.\r\nBe editable, allowing sellers to update Bill of Material or account details.\r\nBe set to “Draft” status and require a new approval process, as offer codes will not be cloned.\r\nClone Quote will be very handy when the seller wants to create RFP quote for multiple resellers or disti (for more then 2 disti).\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:06:48+05:30",
//             "updated": "2025-12-30T21:12:06+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381728",
//             "key": "SFQTC-1309",
//             "projectKey": "sfqtc",
//             "summary": "EU- Quote Stages Logic",
//             "description": "*User Story Description:*\r\n\r\nAs a system, the quote stages should be updated based on the information defined below.\r\n\r\n*Acceptance Criteria:*\r\n # Resellers and Distributors will be able to view Quote stages in Partner Portal along with sales representatives in Salesforce.\r\n # Following will be the Quote stages in \u00A0sequence\r\nDraft: When the Quote is being modified by Sales Rep or Disti or Reseller\r\nIn Review: When the reseller or Disti submits a quote in Partner portal for Logitech sales team review, then the quote status flips to “In Review”.\u00A0\r\nPending Approval: When an SPA quote is submitted for approval and is awaiting action from approvers, its status shall be set to \"Pending Approval.\"\r\nApproved: When quote has been approved by approvers or has been auto-approved. \u00A0\r\nExpired: When the Quote expiration date is met (this is being worked as part of SFQTC-1204)",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:05:26+05:30",
//             "updated": "2026-01-06T03:41:43+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381727",
//             "key": "SFQTC-1308",
//             "projectKey": "sfqtc",
//             "summary": "EU-Distributor Assignment Logic",
//             "description": "*User Story Description:*\r\n\r\nAs a EU seller I should have the ability to select a Sub-Distributor on the Quote which will be mapped to the corresponding Distributor.\r\n\r\n*Acceptance Criteria:*\r\n\r\n1) If the EU seller chooses a sub-distributor then the corresponding mapped contractual Distributor should be selected.\r\n\r\n2) If the contractual distributor is not mapped for the selected sub-distributor, the seller will be alerted at the time of quote submission for approval.\r\n\r\n*NOTES:*\r\n\r\nIn the EU, during the quoting process, a reseller can select a local sub-distributor who will then source products from its parent or pan-regional distributor. For instance, if a reseller chooses Ingram Netherlands as the distributor on the quote, the sub-distributor (Ingram Netherlands) will fulfill the order by procuring inventory from the pan distributor (Ingram Pan Europe, UK).\r\nIn this scenario, both the sub-distributor and the pan distributor are granted quoting access. However, the offer code is issued directly to the pan distributor.\r\n\r\n*Technical Design*\r\nNeed to introduce a new field under Partner Tier/Track as “Sub-Distributor”. This attribute will be mapped only when Type = “Distributor”\u00A0\r\nAll the Sub-Distributors need to be marked as “Sub-Distributor” in Salesforce.\u00A0\r\nA field “Contractual Distributor” should be introduced at the partner account record type and for sub-Distributors this field should get populated with the contractual distributor account that needs to receive the offer letter when the sub-distributor creates a quote.\u00A0\r\n\r\n\u00A0\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:04:19+05:30",
//             "updated": "2026-01-06T03:41:43+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2381726",
//             "key": "SFQTC-1307",
//             "projectKey": "sfqtc",
//             "summary": "EU-Ability for Sellers to Create SPA Quotes from Salesforce",
//             "description": "*User Story Description:*\r\n\r\nAs an EU Seller, I will have the ability to Create a SPA quote from the opportunity.\r\n\r\n*Acceptance Criteria:*\r\n\r\nSellers can create a quote from the opportunity, with the ability to:\r\n * Select the relevant pricebook and currency\r\n * Choose a distributor (Disti) or sub-distributor (Sub-disti)\r\n * Specify the T2 account; T3 information is auto-copied from the opportunity\r\n * The quote is calculated in the currency selected by the seller.\r\n\r\n\u00A0",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14920",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-30T01:03:23+05:30",
//             "updated": "2026-01-21T02:33:48+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2374403",
//             "key": "SFQTC-1291",
//             "projectKey": "sfqtc",
//             "summary": "Impartner - Reword 'Include Recommended Services' text",
//             "description": null,
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Enhancement",
//             "assignee": null,
//             "assigneeName": null,
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Anjali Katragadda",
//             "storyPoints": null,
//             "labels": [
//                 "DEV-Impartner",
//                 "Must_Have"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-17T22:38:40+05:30",
//             "updated": "2026-01-20T20:39:30+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2371874",
//             "key": "SFQTC-1287",
//             "projectKey": "sfqtc",
//             "summary": "SFDC - ORACLE integration to populate Oracle currency field in Salesforce",
//             "description": "*Context* -\r\nOracle has different currency fields. Currency in which T1 or T2 want to transact is captured in Oracle as part of onboarding process. Whenever offers are created for these partners, expectation is that this currency set at account in Oracle is used.\r\n\r\n*Current Process* - \r\nAs part of MDF and LEAP project, Oracle Currency field was created in Salesforce. But as of now it is manual process for MDF/Leap onboarding team that they need to confirm with Oracle tea what is the value in Oracle and then they update it in Salesforce.\r\n\r\n*Future Process* - \r\nWhen CPQ is rollout to Europe, we need this field more often and cannot rely on manual setup. Hence proposal is to integrate population of this field as soon as\r\n # Transaction currency is set in Oracle.\r\n # Anytime transaction currency is changed in Oracle. \r\nThis should be only one way integration. Oracle feeds data to SFDC. \r\nSFDC field should become read-only or very limited people should have access to change in scenarios where something is urgent and Oracle updates might take time so with PO approval, need data fix in Salesforce as temp solution.",
//             "status": "Scoping Required",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": "mraheja1",
//             "assigneeName": "Megha Raheja",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Arati Jana",
//             "storyPoints": null,
//             "labels": [
//                 "MUST_Europe_CPQ"
//             ],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-16T01:04:24+05:30",
//             "updated": "2025-12-16T01:50:22+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2366753",
//             "key": "SFQTC-1264",
//             "projectKey": "sfqtc",
//             "summary": "Impartner - Capture reason if service auto attach is disabled",
//             "description": null,
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": "pp1",
//             "assigneeName": "Praveen P",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14925",
//             "reporter": "David Sun",
//             "storyPoints": null,
//             "labels": [
//                 "DEV-Impartner",
//                 "Sprint1.6"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-09T23:17:37+05:30",
//             "updated": "2026-01-09T22:27:21+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2366353",
//             "key": "SFQTC-1260",
//             "projectKey": "sfqtc",
//             "summary": "Email Functionality for Opp - Convert to SPA",
//             "description": "Modify the 'Opportunity - Convert To SPA' flow (in hotfix) to incorporate email support components that cater to reseller and distributors. \r\nRefer 'Lead - Convert to SPA implementation' to build similar flow components.\r\ntech design: https://docs.google.com/document/d/1KYHQxmwdifzTLN_BBJizNfyeZsoNoqkPSYwdnKl1OzE/edit?tab=t.0\r\n\r\nCreate new vf templates, global contents and translated contents as per the tech design.\r\n\r\n",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Sub-task",
//             "assignee": "rramesh",
//             "assigneeName": "Ramya Ramesh",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Naveena Ravichandran",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-09T17:18:02+05:30",
//             "updated": "2025-12-09T17:18:02+05:30",
//             "dueDate": null,
//             "epicKey": "SFQTC-1194",
//             "epicName": "ON HOLD - Convert DR Opportunity To SPA Opportunity - Deal Registration Submitted by a Reseller under SPA RFP Scenario"
//         },
//         {
//             "id": "2359785",
//             "key": "SFQTC-1228",
//             "projectKey": "sfqtc",
//             "summary": "Issue : Observation on Product showing up in spilt child opportunities when Parent Quote updated after Split is done and removed few pre-allocated products.",
//             "description": "Even though product is not there on synced quote or on parent opportunity products , its still available in split child opportunities 1 and 2\r\n\r\nFor the below parent opportunity, we dont have Combo touch product not on the synced quote we have it, but we are able to see this product on both child split opportunity 1 and 2.\r\n\r\nhttps://logitechsales--uat.sandbox.lightning.force.com/lightning/r/Opportunity/006Oy00000TNEMXIA5/view\r\n\r\nsynced quote - https://logitechsales--uat.sandbox.lightning.force.com/lightning/r/Quote/0Q0Oy000002lenFKAQ/view\r\n\r\nCan you please check why the product Combo touch is still showing on split child opt 1 and 2 as it no more exists on parent opportunity or on quote\r\n\r\n*Accepted Solution:*\r\n2. If child is not closed, let system delete child opportunity line items. This can fix issue if child is not Closed but we still have problem if any child is WON or LOST and that has Rallybar.  **Yes - if open, the product can be removed.  If Won or Lost, do not remove product.*\r\n*",
//             "status": "Design Required",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "pp1",
//             "assigneeName": "Praveen P",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=14925",
//             "reporter": "Lallu Prasad Chowdary",
//             "storyPoints": null,
//             "labels": [
//                 "QABugs_QTC",
//                 "split_Oppotunity"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-02T14:06:14+05:30",
//             "updated": "2026-01-07T11:00:27+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2359264",
//             "key": "SFQTC-1216",
//             "projectKey": "sfqtc",
//             "summary": "Salesforce - Capture reason if service auto attach is disabled",
//             "description": null,
//             "status": "Pending",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": "akatragadda",
//             "assigneeName": "Anjali Katragadda",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Nitin Tooteja",
//             "storyPoints": null,
//             "labels": [
//                 "Blocked-Requirements",
//                 "DEV-OSF"
//             ],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-02T01:41:12+05:30",
//             "updated": "2026-01-23T22:21:40+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2358771",
//             "key": "SFQTC-1220",
//             "projectKey": "sfqtc",
//             "summary": "VR on Editing NAM DR Quote Expiration Date",
//             "description": "We need to stop users in Salesforce from being able to edit the quote expiration date on DR Quotes.\r\n\r\nOpportunity Expiration Date should flow on the DR Quotes.\r\n\r\nPlease put a Validation Rule to stop users from editing Quote Expiration Date on DR Quotes.\r\n\r\nSystem Admins and Global Admins should be exempted from this VR.\r\n\r\nWhenever a user tries to change the Quote Expiration Date throw an error message - \"Expiration Date cannot be modified on DR Quotes. Please ask your partner to submit an extension request through the Partner Portal or contact your System Administrator.\"\r\n\r\n\u00A0\r\n\r\n-------------------------------------------------------------------------------------------------------\r\n\r\nIGNORE BELOW\r\n\r\n[https://logitechsales.lightning.force.com/lightning/r/Opportunity/006Pb00000gMq9RIAS/view]\r\n\r\n!image.png|thumbnail!\r\n\r\n!image.png|thumbnail!\r\n\r\nThank you,\r\n\r\n{color:#000000}Pam Gelletly{color}\r\n\r\n{color:#000000}Logitech Mid Market Sales - South Region{color}\r\n\r\n{color:#666666}813.601.6863{color}\r\n\r\n{color:#666666}Richmond, VA{color}\r\n\r\n[{color:#222222}Logitech{color}|https://www.logitech.com/en-us/business.html] [{color:#222222}LinkedIn{color}|https://www.linkedin.com/in/pamela-gelletly-0207297/]\r\n\r\n{color:#000000}Looking for support?{color} [{color:#000000}Logitech Hub{color}|https://sync.logitech.com/hub/support]{color:#000000}Interested in our premium support?{color} [{color:#1155cc}Check out Logitech Select{color}|https://www.logitech.com/en-ch/products/video-conferencing/room-solutions/select-premium-service-plan.html]\r\n\r\nTech Notes:\r\nWe have implemented modifications to the current validation rules for quote expiration dates:\r\n\r\n1) Expiration Date Check-  it restricts quote expiration date updates to any date beyond March 31, 2026 for SPA quotes.\r\n\r\n2) Expiration date null or past - This validation rule prevents users from updating quote expiration dates to past dates or leaving the field blank for both DR and SPA quotes.\r\n\r\n3) Prevent expiration to past with offers - A new validation rule has been created exclusively for SPA quotes (not cancelled)  to prevent users from setting an expiration date earlier than the prior expiration date when an offer has been generated for that quote. The system displays the message: \"Expiration date cannot be set to an earlier date because there is an offer linked to this quote.\"\r\n\r\n4) Prevent Manual Changes on DR Expiration - A new validation rule has been created that will prevent the expiration date updates on quotes while verifying that both quote expiration date and opportunity expiration date remain synchronized for DR quotes (not cancelled). This prevents users from manually modifying DR quote expiration dates.                                                                                                                                          All these validation rules will be skipped for system admin. ",
//             "status": "Ready for Release",
//             "priority": "Major",
//             "type": "Story",
//             "assignee": "akatragadda",
//             "assigneeName": "Anjali Katragadda",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=10122",
//             "reporter": "Pam Gelletly",
//             "storyPoints": 0,
//             "labels": [],
//             "components": [
//                 "CRM"
//             ],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-01T21:46:00+05:30",
//             "updated": "2026-01-28T12:06:11+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         },
//         {
//             "id": "2358622",
//             "key": "SFQTC-1213",
//             "projectKey": "sfqtc",
//             "summary": "Offer Code Error - Connections Could not be acquired from the underlying database",
//             "description": "This error is stopping several Offers.\r\n\r\n!image-2025-12-01-07-48-20-501.png!\r\n\r\n\u00A0\r\n|Connections could not be acquired from the underlying database!\r\n\u00A0|[O-034320|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003tFEPIA2/view]\r\n\u00A0|Pending\r\n\u00A0|[LOGI - O000316324 - Revenu Québec|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000aqGtaKAE/view]\r\n\u00A0|[RQ-FY26Q3-TWS_RFP-SPA|https://logitechsales.lightning.force.com/lightning/r/006Pb00000zf4FpIAI/view]\r\n\u00A0|12/1/2025\r\n\u00A0|[Revenu Québec|https://logitechsales.lightning.force.com/lightning/r/00150000010S1BjAAK/view]\r\n\u00A0|Marc-antoine / Renée Dionne / Dufresne\r\n\u00A0|[AVI-SPL Canada|https://logitechsales.lightning.force.com/lightning/r/0015000001Ai6KxAAJ/view]\r\n\u00A0|[Emmanuel Perez|https://logitechsales.lightning.force.com/lightning/r/0031T00003OdByeQAF/view]\r\n\u00A0|[TD SYNNEX Canada|https://logitechsales.lightning.force.com/lightning/r/0011T00002eQ4LtQAK/view]\r\n\u00A0|[TDS Canada Team Inbox|https://logitechsales.lightning.force.com/lightning/r/0034X00003ScALnQAN/view]\r\n\u00A0|\r\n||14|Connections could not be acquired from the underlying database!\r\n\u00A0|[O-034321|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003tFEQIA2/view]\r\n\u00A0|Pending\r\n\u00A0|[LOGI - O000316324 - Revenu Québec|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000aqGtaKAE/view]\r\n\u00A0|[RQ-FY26Q3-TWS_RFP-SPA|https://logitechsales.lightning.force.com/lightning/r/006Pb00000zf4FpIAI/view]\r\n\u00A0|12/1/2025\r\n\u00A0|[Revenu Québec|https://logitechsales.lightning.force.com/lightning/r/00150000010S1BjAAK/view]\r\n\u00A0|Marc-antoine / Renée Dionne / Dufresne\r\n\u00A0|[AVI-SPL Canada|https://logitechsales.lightning.force.com/lightning/r/0015000001Ai6KxAAJ/view]\r\n\u00A0|[Emmanuel Perez|https://logitechsales.lightning.force.com/lightning/r/0031T00003OdByeQAF/view]\r\n\u00A0|[Ingram Micro Canada|https://logitechsales.lightning.force.com/lightning/r/0011T00002eNj3YQAS/view]\r\n\u00A0|[Logitech Ingram Micro|https://logitechsales.lightning.force.com/lightning/r/003Pb00001AbJ2IIAV/view]\r\n\u00A0|\r\n||15|Connections could not be acquired from the underlying database!\r\n\u00A0|[O-034322|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003tFG1IAM/view]\r\n\u00A0|Pending\r\n\u00A0|[LOGI - O000317710 - CUPE|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000aIq3RKAS/view]\r\n\u00A0|[Cupe-MFST TWS-Fy26Q3-SPA|https://logitechsales.lightning.force.com/lightning/r/006Pb000010iPJxIAM/view]\r\n\u00A0|11/18/2025\r\n\u00A0|[CUPE|https://logitechsales.lightning.force.com/lightning/r/0015000001FAIVsAAP/view]\r\n\u00A0|Stephen Nava\r\n\u00A0|[Dell - Channel Partner - Canada|https://logitechsales.lightning.force.com/lightning/r/00150000019zTTgAAM/view]\r\n\u00A0|[Renata Menezes|https://logitechsales.lightning.force.com/lightning/r/003Pb000018kaZeIAI/view]\r\n\u00A0|[TD SYNNEX Canada|https://logitechsales.lightning.force.com/lightning/r/0011T00002eQ4LtQAK/view]\r\n\u00A0|[TDS Canada Team Inbox|https://logitechsales.lightning.force.com/lightning/r/0034X00003ScALnQAN/view]\r\n\u00A0|\r\n||16|Connections could not be acquired from the underlying database!\r\n\u00A0|[O-034323|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003tFG2IAM/view]\r\n\u00A0|Pending\r\n\u00A0|[LOGI - O000317710 - CUPE|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000aIq3RKAS/view]\r\n\u00A0|[Cupe-MFST TWS-Fy26Q3-SPA|https://logitechsales.lightning.force.com/lightning/r/006Pb000010iPJxIAM/view]\r\n\u00A0|11/18/2025\r\n\u00A0|[CUPE|https://logitechsales.lightning.force.com/lightning/r/0015000001FAIVsAAP/view]\r\n\u00A0|Stephen Nava\r\n\u00A0|[Dell - Channel Partner - Canada|https://logitechsales.lightning.force.com/lightning/r/00150000019zTTgAAM/view]\r\n\u00A0|[Renata Menezes|https://logitechsales.lightning.force.com/lightning/r/003Pb000018kaZeIAI/view]\r\n\u00A0|[Ingram Micro Canada|https://logitechsales.lightning.force.com/lightning/r/0011T00002eNj3YQAS/view]\r\n\u00A0|[Logitech Ingram Micro|https://logitechsales.lightning.force.com/lightning/r/003Pb00001AbJ2IIAV/view]\r\n\u00A0|\r\n||17|Connections could not be acquired from the underlying database!\r\n\u00A0|[O-034324|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003tFHdIAM/view]\r\n\u00A0|Pending\r\n\u00A0|[LOGI - O000319495 - State of California (CDW QUOTE)|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000b2bcUKAQ/view]\r\n\u00A0|[California State Parks-Room Upgrade (MERGENT,CDW) SPA|https://logitechsales.lightning.force.com/lightning/r/006Pb000011ecqJIAQ/view]\r\n\u00A0|12/1/2025\r\n\u00A0|[State of California|https://logitechsales.lightning.force.com/lightning/r/0014X00002kMZVhQAO/view]\r\n\u00A0|phillip usrey\r\n\u00A0|[CDW|https://logitechsales.lightning.force.com/lightning/r/0015000000ftVnDAAU/view]\r\n\u00A0|[tommy Baxter|https://logitechsales.lightning.force.com/lightning/r/0034X00003RFRquQAH/view]\r\n\u00A0|[Ingram Micro US|https://logitechsales.lightning.force.com/lightning/r/0015000001PcC1VAAV/view]\r\n\u00A0|[Logitech Team|https://logitechsales.lightning.force.com/lightning/r/0035000003B9aFbAAJ/view]\r\n\u00A0|\r\n||18|Connections could not be acquired from the underlying database!\r\n\u00A0|[O-034325|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003tFpVIAU/view]\r\n\u00A0|Pending\r\n\u00A0|[LOGI - DR0001210067 - MDA SYSTEMS LTD. (Main)|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000bLepxKAC/view]\r\n\u00A0|[MDA SYSTEMS LTD.-MFST TWS-Fy26Q3-DR CDW|https://logitechsales.lightning.force.com/lightning/r/006Pb00000j7U4LIAU/view]\r\n\u00A0|12/1/2025\r\n\u00A0|[MDA SYSTEMS LTD. (Main)|https://logitechsales.lightning.force.com/lightning/r/0011T00002adloDQAQ/view]\r\n\u00A0|Luc Darveau\r\n\u00A0|[CDW Canada|https://logitechsales.lightning.force.com/lightning/r/0015000001AKjalAAD/view]\r\n\u00A0|[Kiran Sidhu|https://logitechsales.lightning.force.com/lightning/r/0031T00004HcjQAQAZ/view]\r\n\u00A0|[TD SYNNEX Canada|https://logitechsales.lightning.force.com/lightning/r/0011T00002eQ4LtQAK/view]\r\n\u00A0|[TDS Canada Team Inbox|https://logitechsales.lightning.force.com/lightning/r/0034X00003ScALnQAN/view]\r\n\u00A0|\r\n||19|Connections could not be acquired from the underlying database!\r\n\u00A0|[O-034326|https://logitechsales.lightning.force.com/lightning/r/a0bPb000003tFpWIAU/view]\r\n\u00A0|Pending\r\n\u00A0|[LOGI - DR0001210067 - MDA SYSTEMS LTD. (Main)|https://logitechsales.lightning.force.com/lightning/r/0Q0Pb00000bLepxKAC/view]\r\n\u00A0|[MDA SYSTEMS LTD.-MFST TWS-Fy26Q3-DR CDW|https://logitechsales.lightning.force.com/lightning/r/006Pb00000j7U4LIAU/view]\r\n\u00A0|12/1/2025\r\n\u00A0|[MDA SYSTEMS LTD. (Main)|https://logitechsales.lightning.force.com/lightning/r/0011T00002adloDQAQ/view]\r\n\u00A0|Luc Darveau\r\n\u00A0|[CDW Canada|https://logitechsales.lightning.force.com/lightning/r/0015000001AKjalAAD/view]\r\n\u00A0|[Kiran Sidhu|https://logitechsales.lightning.force.com/lightning/r/0031T00004HcjQAQAZ/view]\r\n\u00A0|[Ingram Micro Canada|https://logitechsales.lightning.force.com/lightning/r/0011T00002eNj3YQAS/view]\r\n\u00A0|[Harpreet Kataria|https://logitechsales.lightning.force.com/lightning/r/003Pb00000zAfI7IAK/view]|",
//             "status": "Waiting for Triage",
//             "priority": "Major",
//             "type": "Bug",
//             "assignee": "rsampathkumar",
//             "assigneeName": "Ramya Sampathkumar",
//             "assigneeAvatar": "https://jira.logitech.com/secure/useravatar?avatarId=19008",
//             "reporter": "Shannon Johnson",
//             "storyPoints": null,
//             "labels": [],
//             "components": [],
//             "sprint": null,
//             "sprintId": null,
//             "created": "2025-12-01T19:18:41+05:30",
//             "updated": "2025-12-01T19:18:41+05:30",
//             "dueDate": null,
//             "epicKey": null,
//             "epicName": null
//         }
//     ]
// }};
    return response.data;
  },

  getDependencyGraph: async (projectKey: string): Promise<any> => {
    const response = await api.post(`/api/jira/dependency-graph/${projectKey}`);
    return response;
  },

  getBacklogHealth: async (projectKey: string): Promise<any> => {
    const response = await api.post(`/api/jira/backlog/${projectKey}/health`);
    return response.data;
  },

  predictStoryPoints: async (tickets: StoryTicketRequest[]): Promise<any> => {
    const response = await api.post(`/api/jira/predict`, tickets);
    return response.data;
  },

  getSprints: async (projectKey: string): Promise<any> => {
    const response = await api.post(`/api/jira/projects/${projectKey}/sprints?sprintCount=5`);
    return response.data;
  },

  getSprintBurndown: async (projectKey:string,sprintId: string): Promise<any> => {
    const response = await api.post(`/api/jira/${projectKey}/${sprintId}/burndown`);
    return response.data;
  },

  getSprintScopeChanges: async (projectKey:string,sprintId: string): Promise<any> => {
    const response = await api.post(`/api/jira/${projectKey}/${sprintId}/scope`);
    return response.data;
  },

  getTeamMembers: async (projectKey:string): Promise<TeamMembersResponse> => {
    const response = await api.post(`/api/jira/projects/${projectKey}/team`);
    return response.data;
  }
};

//AI API
export const ai = {
  autoassign: async (request: AutoAssignRequest): Promise<AutoAssignResponse> => {
    const response = await api.post(`/api/ai/auto-assign`, request);
    return response.data;
  },
  retrospective: async (projectKey: string, sprintId: string, request?: RetrospectiveRequest): Promise<SprintRetrospective> => {
    const response = await api.post(`/api/jira/projects/${projectKey}/sprints/${sprintId}/retrospective`, request);
    return response.data;
  }
};