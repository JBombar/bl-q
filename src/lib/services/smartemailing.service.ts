/**
 * SmartEmailing.cz API Service
 *
 * Fire-and-forget wrapper around the SmartEmailing REST API (v3).
 * Every exported function catches errors internally and never throws,
 * making it safe to call from hot paths without risking unhandled rejections.
 */

import { smartEmailingConfig } from '@/config/smartemailing.config';

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const { baseUrl, username, apiKey, contactLists } = smartEmailingConfig;

/**
 * Pre-computed Basic Auth header value.
 * Empty when credentials are not configured (dev/CI environments).
 */
const authHeader =
  username && apiKey
    ? 'Basic ' + Buffer.from(username + ':' + apiKey).toString('base64')
    : '';

/**
 * Returns true when the service is properly configured and ready to make
 * API calls.  When false, all public functions exit early with a warning.
 */
function isConfigured(): boolean {
  if (!username || !apiKey) {
    console.warn(
      '[SmartEmailing] Service is not configured (missing username or apiKey). Skipping API call.',
    );
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Core import function
// ---------------------------------------------------------------------------

interface ContactListEntry {
  id: number;
  status: 'confirmed' | 'removed';
}

interface ImportContactParams {
  email: string;
  firstName?: string;
  contactListEntries: ContactListEntry[];
}

/**
 * Import (create or update) a single contact into SmartEmailing with the
 * given list memberships.
 *
 * This is the low-level building block used by all convenience helpers.
 * It never throws -- all errors are caught and logged.
 */
async function importContact(params: ImportContactParams): Promise<void> {
  if (!isConfigured()) return;

  const { email, firstName, contactListEntries } = params;

  const body = {
    settings: {
      update: true,
      preserve_unsubscribed: true,
    },
    data: [
      {
        emailaddress: email,
        ...(firstName ? { name: firstName } : {}),
        contactlists: contactListEntries,
      },
    ],
  };

  try {
    const response = await fetch(`${baseUrl}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '<unreadable body>');
      console.error(
        `[SmartEmailing] Import failed for ${email}: HTTP ${response.status} - ${text}`,
      );
    }
  } catch (error) {
    console.error(`[SmartEmailing] Import request error for ${email}:`, error);
  }
}

// ---------------------------------------------------------------------------
// Convenience functions
// ---------------------------------------------------------------------------

/**
 * Add a contact to the ALL_CONTACTS list.
 */
export async function addToAllContacts(
  email: string,
  firstName?: string,
): Promise<void> {
  await importContact({
    email,
    firstName,
    contactListEntries: [{ id: contactLists.ALL_CONTACTS, status: 'confirmed' }],
  });
}

/**
 * Add a contact to the REGULAR list.
 */
export async function addToRegular(
  email: string,
  firstName?: string,
): Promise<void> {
  await importContact({
    email,
    firstName,
    contactListEntries: [{ id: contactLists.REGULAR, status: 'confirmed' }],
  });
}

/**
 * Promote a contact to the PREMIUM list and simultaneously remove them
 * from the REGULAR list.
 */
export async function promoteToPremiun(
  email: string,
  firstName?: string,
): Promise<void> {
  await importContact({
    email,
    firstName,
    contactListEntries: [
      { id: contactLists.PREMIUM, status: 'confirmed' },
      { id: contactLists.REGULAR, status: 'removed' },
    ],
  });
}

/**
 * Add a contact to the ABANDONED list (e.g. abandoned cart / checkout).
 */
export async function addToAbandoned(
  email: string,
  firstName?: string,
): Promise<void> {
  await importContact({
    email,
    firstName,
    contactListEntries: [{ id: contactLists.ABANDONED, status: 'confirmed' }],
  });
}

/**
 * Remove a contact from the ABANDONED list.
 */
export async function removeFromAbandoned(email: string): Promise<void> {
  await importContact({
    email,
    contactListEntries: [{ id: contactLists.ABANDONED, status: 'removed' }],
  });
}
