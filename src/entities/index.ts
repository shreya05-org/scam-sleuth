/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: jobrolesalaryranges
 * Interface for JobRoleSalaryRanges
 */
export interface JobRoleSalaryRanges {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  jobRoleTitle?: string;
  /** @wixFieldType number */
  minSalary?: number;
  /** @wixFieldType number */
  maxSalary?: number;
  /** @wixFieldType text */
  currency?: string;
  /** @wixFieldType text */
  payPeriod?: string;
}


/**
 * Collection ID: redflagcriteria
 * Interface for RedFlagCriteria
 */
export interface RedFlagCriteria {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  name?: string;
  /** @wixFieldType text */
  keywords?: string;
  /** @wixFieldType text */
  explanation?: string;
  /** @wixFieldType number */
  riskContribution?: number;
  /** @wixFieldType text */
  severityLevel?: string;
}


/**
 * Collection ID: riskrecommendations
 * Interface for RiskRecommendations
 */
export interface RiskRecommendations {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  riskLevel?: string;
  /** @wixFieldType text */
  generalRecommendation?: string;
  /** @wixFieldType text */
  upfrontPaymentGuidance?: string;
  /** @wixFieldType text */
  urgencyLanguageGuidance?: string;
  /** @wixFieldType text */
  externalMessagingGuidance?: string;
  /** @wixFieldType text */
  salaryAnomalyGuidance?: string;
}
