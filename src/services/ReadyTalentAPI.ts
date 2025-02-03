export interface JobListing {
  // Common Information
  jobId: string;
  jobPostingId: string;
  jobName: string;
  jobType: string;
  companyName: string;
  companyImageUrl?: string;
  resumeRequired: boolean;
  numOfVacancies: number;
  applicationDeadline: string; // Application End Date?
  createdDate?: string;
  actualEndDate?: string; // Internal End Date?
  eligibleDegrees?: string[];
  jobDetail: JobDetail;
  applicants: ApplicantDetail[];
}

export interface SchoolJobListing extends JobListing {
  type: "SCHOOL";
  renumerationType: string;
  skillset: string;
  rate: number;
  supervisor: string;
}

export interface GenericListing extends JobListing {
  type: "GENERIC";
  allowance: number;
  otherRemunerations: string;
}

function mapJobListing(rawData: any): JobListing {
  const commonFields = {
    jobId: rawData["sit_employmentlistingid"],
    jobPostingId: rawData["sit_jobpostingid"],
    jobName: rawData["sit_name"],
    jobType:
      rawData[
        "_sit_employmenttype_value@OData.Community.Display.V1.FormattedValue"
      ],
    companyName: rawData["acc.name"],
    companyImageUrl: rawData["acc.entityimageid_entityimage_url"] || undefined,
    resumeRequired: rawData["sit_resumerequired"],
    numOfVacancies: rawData["sit_numberofvacancies"],
    applicationDeadline: rawData["sit_applicationdeadline"],
    createdDate: rawData["createdon"],
    actualEndDate: rawData["sit_actualenddate"],
    eligibleDegrees: rawData["ab.sit_degreeprogramname"]?.split("|") || [],
  };

  // Check if it's an School Job Listing
  if (commonFields.companyName === "SINGAPORE INSTITUTE OF TECHNOLOGY") {
    return {
      ...commonFields,
      type: "SCHOOL", // Discriminator for SIT listings
      renumerationType: rawData["sit_remunerationtype"],
      skillset: rawData["sit_skillset"],
      rate: rawData["sit_rate"],
      supervisor: rawData["sit_supervisor"],
    } as SchoolJobListing;
  } else {
    return {
      ...commonFields,
      type: "GENERIC", //discriminatorforgenericlistings
      allowance: rawData["sit_allowance"] || 0,
      otherRemunerations: rawData["sit_remunerationothers"] || "",
    } as GenericListing;
  }
}

export interface ApplicantDetail {
  applicantName: string;
  createdDate: Date;
}

function mapToApplicantDetail(data: any): ApplicantDetail {
  return {
    // Core information
    applicantName: data["sit_name"],
    createdDate: data["createdon"],
  };
}

export interface JobDetail {
  // Core information
  jobId: string;
  roleName: string;
  companyName: string;
  companyWebsite?: string;
  companyProfile?: string;
  companyAddress?: string;

  // Job description and requirements
  jobDescription: string;
  jobRequirements?: string;
  skillset?: string;

  // Employment details
  employmentType: string;
  workingHours: string;
  startDate: Date;
  endDate: Date;
  applicationDeadline: Date;
  numberOfVacancies: number;
  numberOfApplications: number;

  // Location
  location?: {
    street?: string;
    country: string;
  };

  // Compensation and benefits
  remunerationType?: "Hourly" | "Monthly";
  remunerationRate?: number;
  allowance?: number;
  otherBenefits?: string;

  // Application requirements
  resumeRequired: boolean;
  transcriptRequired: boolean;
  coverLetterRequired: boolean;
  otherDocumentsRequired: boolean;

  // Contact information
  supervisorName?: string;
  contactEmail?: string;

  // Additional details
  createdOn: Date;
  lodgingProvided: boolean;
  viewableOnJobPortal: boolean;
}

function isTokenExpired(data: any): boolean {
  if ("message" in data && data["message"] === "Forbidden") {
    return true;
  } else {
    return false;
  }
}

function mapToJobDetail(data: any): JobDetail {
  return {
    // Core information
    jobId: data.sit_jobpostingid,
    roleName: data.sit_name,
    companyName:
      data["_sit_account_value@OData.Community.Display.V1.FormattedValue"] ||
      data["acc.name"],
    companyWebsite: data["acc.websiteurl"],
    companyProfile: data["acc.sit_companyprofile"],
    companyAddress:
      data["otheradd.sit_street1"] +
      data["otheradd.sit_country@OData.Community.Display.V1.FormattedValue"],

    // Job description and requirements
    jobDescription: data.sit_jobdescription,
    jobRequirements: data.sit_jobrequirements,
    skillset: data.sit_skillset,

    // Employment details
    employmentType:
      data[
        "_sit_employmenttype_value@OData.Community.Display.V1.FormattedValue"
      ],
    workingHours: data.sit_workinghours,
    startDate: new Date(data.sit_actualstartdate),
    endDate: new Date(data.sit_actualenddate),
    applicationDeadline: new Date(data.sit_applicationdeadline),
    numberOfVacancies: Number(data.sit_numberofvacancies),
    numberOfApplications: Number(data.sit_noofstudentapplication || 0),

    // Location
    location: {
      street: data["otheradd.sit_street1"],
      country:
        data["otheradd.sit_country@OData.Community.Display.V1.FormattedValue"],
    },

    // Compensation and benefits
    remunerationType: data.sit_remunerationtype === 2 ? "Hourly" : "Monthly",
    remunerationRate: Number(data.sit_rate || 0),
    allowance: Number(data.sit_allowance || 0),
    otherBenefits: data.sit_otherbenefits,

    // Application requirements
    resumeRequired:
      data.sit_resumerequired === true || data["ses.sit_resume"] === true,
    transcriptRequired: data["ses.sit_transcripts"] === true,
    coverLetterRequired: data["ses.sit_coverletter"] === true,
    otherDocumentsRequired: data["ses.sit_otherrelevantdocuments"] === true,

    // Contact information
    supervisorName: data.sit_supervisor,
    contactEmail: data.sit_email,

    // Additional details
    createdOn: new Date(data.createdon),
    lodgingProvided: data.sit_lodgingprovided === true,
    viewableOnJobPortal: data.sit_viewjobportal === true,
  };
}

const API_CONFIG = {
  baseUrl: "https://mvw9e7kvt9.execute-api.ap-southeast-1.amazonaws.com/Prod",
  defaultHeaders: {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-length": "0",
    origin: "https://readytalent2.singaporetech.edu.sg",
    referer: "https://readytalent2.singaporetech.edu.sg/",
  },
} as const;

export async function fetchAllJobListings(
  apiToken: string,
  studentId: string
): Promise<JobListing[]> {
  // First request
  const queryParams1 = new URLSearchParams({
    requestname: "LoadPartTimeJobDetailsStudentDashboard",
    studentId,
    accessLevelCondition: "",
    loginaccessType: "Student",
  });

  // Second request
  const queryParams2 = new URLSearchParams({
    requestname: "LoadJobDetailsStudentDashboard",
    studentId,
    accessLevelCondition: "",
    loginaccessType: "Student",
  });

  const [response1, response2] = await Promise.all([
    fetch(`${API_CONFIG.baseUrl}?${queryParams1}`, {
      method: "POST",
      headers: {
        ...API_CONFIG.defaultHeaders,
        apitoken: apiToken,
      },
    }),
    fetch(`${API_CONFIG.baseUrl}?${queryParams2}`, {
      method: "POST",
      headers: {
        ...API_CONFIG.defaultHeaders,
        apitoken: apiToken,
      },
    }),
  ]);

  if (!response1.ok || !response2.ok) {
    throw new Error(
      `Failed to fetch job listings: ${response1.statusText} ${response2.statusText}`
    );
  }

  const data1 = await response1.json();
  const data2 = await response2.json();

  console.log("fetchAllJobListing - PartTime", data1);
  console.log("fetchAllJobListing - Regular", data2);

  if (isTokenExpired(data1) || isTokenExpired(data2)) {
    throw new Error("API Token has expired. Please enter new token!");
  }

  // Combine and map both sets of listings
  return [...data1, ...data2].map(mapJobListing);
}

export function createFetchJobDetail(apiToken: string, studentId: string) {
  return async (jobId: string): Promise<JobDetail> => {
    return fetchJobDetail(apiToken, jobId, studentId);
  };
}

export async function fetchJobDetail(
  apiToken: string,
  jobId: string,
  studentId: string
): Promise<JobDetail> {
  const queryParams = new URLSearchParams({
    requestname: "LoadJobDetailsForStudent",
    jobid: jobId,
    studentId: studentId,
    empSessionId: "null",
    includeApplicabledate: "true",
  });

  const response = await fetch(`${API_CONFIG.baseUrl}?${queryParams}`, {
    method: "POST",
    headers: {
      ...API_CONFIG.defaultHeaders,
      apitoken: apiToken,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch job detail for ${jobId}, Error: ${response.statusText}`
    );
  }
  const data = await response.json();

  if (isTokenExpired(data)) {
    throw new Error("API Token has expired. Please enter new token!");
  }

  return mapToJobDetail(data[0]);
}

export async function fetchApplicantsForJob(
  apiToken: string,
  jobId: string
): Promise<ApplicantDetail[]> {
  const queryParams = new URLSearchParams({
    requestname: "GetStudentApplicationDetails",
    empListId: jobId,
  });

  const response = await fetch(`${API_CONFIG.baseUrl}?${queryParams}`, {
    method: "POST",
    headers: {
      ...API_CONFIG.defaultHeaders,
      apitoken: apiToken,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch applicant details for ${jobId}, Error: ${response.statusText}`
    );
  }
  const data = await response.json();

  if (isTokenExpired(data)) {
    throw new Error("API Token has expired. Please enter new token!");
  }

  return data.map(mapToApplicantDetail);
}
