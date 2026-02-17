import { MinimalHeader } from '@/components/layouts/minimal-header';

export default function SharedResultsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MinimalHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
