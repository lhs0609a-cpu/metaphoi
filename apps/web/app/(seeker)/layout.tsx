import { SeekerNav } from '@/components/layouts/seeker-nav';

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SeekerNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
