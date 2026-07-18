export interface RecruiterContact {
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
}

export const findRecruiterEmails = async (companyName: string, customDomain?: string): Promise<RecruiterContact[]> => {
  let apiKey = '';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      apiKey = window.localStorage.getItem('hunter-api-key') || '';
    }
  } catch(e) {}
  
  if (!apiKey) {
    try {
      apiKey = import.meta.env.VITE_HUNTER_API_KEY || '';
    } catch(e) {}
  }

  if (!apiKey) {
    throw new Error("Missing Hunter API key. Please add it in Settings.");
  }

  // Use the custom domain if provided, otherwise search by company name
  const queryParam = customDomain ? `domain=${encodeURIComponent(customDomain)}` : `company=${encodeURIComponent(companyName)}`;
  
  // We specify limit=10 and department=hr to try and filter for recruiters/talent acquisition
  const url = `https://api.hunter.io/v2/domain-search?${queryParam}&department=hr&limit=10&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.details || "Failed to fetch from Hunter.io");
    }

    if (!data.data?.emails || data.data.emails.length === 0) {
      return [];
    }

    // Map the results to our internal interface
    return data.data.emails.map((emailObj: any) => ({
      email: emailObj.value,
      firstName: emailObj.first_name,
      lastName: emailObj.last_name,
      position: emailObj.position,
    }));
  } catch (err: any) {
    console.error("Hunter API Error:", err);
    throw new Error(err.message || "Failed to connect to Hunter API.");
  }
};
