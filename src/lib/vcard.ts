interface VCardData {
  displayName: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  url?: string;
  bio?: string;
}

export function generateVCard(data: VCardData): string {
  const escape = (str: string) =>
    str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const nameParts = data.displayName.split(" ");
  const lastName = nameParts.length > 1 ? nameParts.pop()! : "";
  const firstName = nameParts.join(" ") || data.displayName;

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(data.displayName)}`,
    `N:${escape(lastName)};${escape(firstName)};;;`,
  ];

  if (data.company) lines.push(`ORG:${escape(data.company)}`);
  if (data.jobTitle) lines.push(`TITLE:${escape(data.jobTitle)}`);
  if (data.email) lines.push(`EMAIL;type=INTERNET;type=WORK:${data.email}`);
  if (data.phone) lines.push(`TEL;type=CELL:${data.phone}`);
  if (data.url) lines.push(`URL:${data.url}`);
  if (data.bio) lines.push(`NOTE:${escape(data.bio)}`);

  lines.push("END:VCARD");

  return lines.join("\r\n");
}