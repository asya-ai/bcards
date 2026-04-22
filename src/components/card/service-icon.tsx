import { getServiceIcon, SERVICE_SVG } from "@/lib/service-icons";

export function ServiceIcon({ icon, url, className = "h-5 w-5" }: { icon: string | null; url: string; className?: string }) {
  const iconId = getServiceIcon(icon, url);
  const svgPath = SERVICE_SVG[iconId];

  if (!svgPath) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: svgPath }} />
  );
}