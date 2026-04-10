import { PublicApplicationTrackPage } from "@/components/site/public-application-track-page";

export const revalidate = 3600;

export default function Page() {
  return <PublicApplicationTrackPage />;
}
