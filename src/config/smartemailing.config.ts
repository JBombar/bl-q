/**
 * SmartEmailing.cz Configuration
 *
 * Manages connection settings and contact list IDs for the
 * SmartEmailing email marketing API (v3).
 *
 * All sensitive values are loaded from environment variables.
 * List IDs are parsed as integers with a fallback to 0.
 */

export const smartEmailingConfig = {
  baseUrl: 'https://app.smartemailing.cz/api/v3',
  username: process.env.SMARTEMAILING_USERNAME || '',
  apiKey: process.env.SMARTEMAILING_API_KEY || '',

  contactLists: {
    ALL_CONTACTS: parseInt(process.env.SMARTEMAILING_LIST_ALL || '0', 10),
    REGULAR: parseInt(process.env.SMARTEMAILING_LIST_REGULAR || '0', 10),
    PREMIUM: parseInt(process.env.SMARTEMAILING_LIST_PREMIUM || '0', 10),
    ABANDONED: parseInt(process.env.SMARTEMAILING_LIST_ABANDONED || '0', 10),
  },
} as const;
